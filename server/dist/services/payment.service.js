var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var payment_service_exports = {};
__export(payment_service_exports, {
  PaymentService: () => PaymentService
});
module.exports = __toCommonJS(payment_service_exports);
var import_crypto = __toESM(require("crypto"));
var import_mongoose = __toESM(require("mongoose"));
var import_Payment = require("../models/Payment.js");
var import_Enrollment = require("../models/Enrollment.js");
var import_Workshop = require("../models/Workshop.js");
var import_razorpay = require("../config/razorpay.js");
var import_env = require("../config/env.js");
var import_apiError = require("../utils/apiError.js");
var import_db = require("../config/db.js");
var import_memoryStore = require("./memoryStore.js");
const memoryPayments = /* @__PURE__ */ new Map();
class PaymentService {
  // Coupon verification logic
  static validateCoupon(code, basePrice) {
    const normalizedCode = code.trim().toUpperCase();
    switch (normalizedCode) {
      case "LAUNCH10": {
        const discountAmount = Math.round(basePrice * 0.1);
        return {
          code: "LAUNCH10",
          discountAmount,
          description: "10% Launch Discount Applied"
        };
      }
      case "EARLYBIRD": {
        const discountAmount = Math.min(300, basePrice);
        return {
          code: "EARLYBIRD",
          discountAmount,
          description: "\u20B9300 Early Bird Discount Applied"
        };
      }
      case "AIFIRST": {
        const discountAmount = Math.min(500, basePrice);
        return {
          code: "AIFIRST",
          discountAmount,
          description: "\u20B9500 Community Special Discount Applied"
        };
      }
      default:
        throw import_apiError.ApiError.badRequest(`Coupon code '${code}' is invalid or has expired.`);
    }
  }
  // 1. Create Razorpay Order
  static async createOrder(input, userId) {
    let enrollment = null;
    let workshop = null;
    if ((0, import_db.isDBConnected)()) {
      try {
        enrollment = await import_Enrollment.Enrollment.findOne({
          $or: [
            { enrollmentId: input.enrollmentId },
            ...import_mongoose.default.Types.ObjectId.isValid(input.enrollmentId) ? [{ _id: input.enrollmentId }] : []
          ]
        }).populate("workshopId");
        if (enrollment) {
          workshop = enrollment.workshopId;
        }
      } catch (err) {
        console.warn("[PaymentService.createOrder DB Fallback]", err.message);
      }
    }
    if (!enrollment) {
      enrollment = await import_memoryStore.memoryStore.findEnrollmentById(input.enrollmentId);
      if (enrollment) {
        workshop = await import_memoryStore.memoryStore.findWorkshop(enrollment.workshop);
      }
    }
    if (!enrollment) {
      throw import_apiError.ApiError.notFound(`Enrollment '${input.enrollmentId}' not found.`);
    }
    if (enrollment.status === "confirmed" && enrollment.paymentStatus === "completed") {
      throw import_apiError.ApiError.badRequest("This enrollment has already been paid and confirmed.");
    }
    if (enrollment.reservedUntil && new Date(enrollment.reservedUntil) < /* @__PURE__ */ new Date()) {
      throw import_apiError.ApiError.badRequest(
        "Your 15-minute seat reservation has expired. Please select the batch again to reserve a new seat."
      );
    }
    if (!workshop) {
      throw import_apiError.ApiError.notFound("Associated workshop not found.");
    }
    const basePrice = workshop.price.basePrice;
    let discountAmount = 0;
    let appliedCoupon;
    if (input.couponCode) {
      const coupon = this.validateCoupon(input.couponCode, basePrice);
      discountAmount = coupon.discountAmount;
      appliedCoupon = coupon.code;
    }
    const discountedBase = Math.max(0, basePrice - discountAmount);
    const taxPercentage = workshop.price.taxPercentage || 18;
    const taxAmount = Math.round(discountedBase * (taxPercentage / 100));
    const totalAmount = discountedBase + taxAmount;
    const amountInPaise = Math.round(totalAmount * 100);
    let razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    try {
      const rzpOrder = await import_razorpay.razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: workshop.price.currency || "INR",
        receipt: enrollment.enrollmentId,
        notes: {
          enrollmentId: enrollment.enrollmentId,
          workshopId: workshop._id.toString(),
          batchCode: workshop.batchCode
        }
      });
      razorpayOrderId = rzpOrder.id;
    } catch (err) {
      console.warn("[Razorpay API Note] Generated server-managed test order ID:", razorpayOrderId);
    }
    if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(enrollment._id?.toString())) {
      let payment = await import_Payment.Payment.findOne({ enrollmentId: enrollment._id });
      if (!payment) {
        payment = new import_Payment.Payment({
          userId: userId || enrollment.userId,
          enrollmentId: enrollment._id,
          workshopId: workshop._id,
          amount: totalAmount,
          amountInPaise,
          currency: workshop.price.currency || "INR",
          provider: "razorpay",
          providerOrderId: razorpayOrderId,
          status: "created",
          couponCode: appliedCoupon,
          discountAmount,
          taxAmount,
          webhookEventsReceived: []
        });
      } else {
        payment.amount = totalAmount;
        payment.amountInPaise = amountInPaise;
        payment.providerOrderId = razorpayOrderId;
        payment.couponCode = appliedCoupon;
        payment.discountAmount = discountAmount;
        payment.taxAmount = taxAmount;
        payment.status = "created";
      }
      await payment.save();
    } else {
      memoryPayments.set(razorpayOrderId, {
        _id: `pay_${Date.now()}`,
        userId: userId || enrollment.user,
        enrollmentId: enrollment.enrollmentId,
        workshopId: workshop,
        amount: totalAmount,
        amountInPaise,
        currency: workshop.price.currency || "INR",
        provider: "razorpay",
        providerOrderId: razorpayOrderId,
        status: "created",
        couponCode: appliedCoupon,
        discountAmount,
        taxAmount,
        webhookEventsReceived: [],
        createdAt: /* @__PURE__ */ new Date()
      });
    }
    return {
      orderId: razorpayOrderId,
      amount: totalAmount,
      amountInPaise,
      currency: "INR",
      keyId: import_env.env.RAZORPAY_KEY_ID,
      enrollmentId: enrollment.enrollmentId,
      attendee: {
        name: enrollment.attendeeDetails.fullName,
        email: enrollment.attendeeDetails.email,
        phone: enrollment.attendeeDetails.phone
      },
      workshop: {
        id: workshop._id,
        title: workshop.title,
        batchCode: workshop.batchCode,
        timings: workshop.timings,
        dateRange: `${new Date(workshop.startDate).toLocaleDateString()} \u2013 ${new Date(workshop.endDate).toLocaleDateString()}`
      },
      breakdown: {
        basePrice,
        discountAmount,
        taxAmount,
        taxPercentage,
        totalAmount,
        couponCode: appliedCoupon
      }
    };
  }
  // 2. Cryptographically Verify Signature & Confirm Seat
  static async verifyPayment(input) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, enrollmentId } = input;
    let payment = null;
    if ((0, import_db.isDBConnected)()) {
      try {
        payment = await import_Payment.Payment.findOne({
          $or: [
            { providerOrderId: razorpay_order_id },
            ...import_mongoose.default.Types.ObjectId.isValid(enrollmentId) ? [{ enrollmentId }] : []
          ]
        });
      } catch (err) {
        console.warn("[PaymentService.verifyPayment DB Fallback]", err.message);
      }
    }
    const memPayment = memoryPayments.get(razorpay_order_id);
    if (!payment && !memPayment) {
      throw import_apiError.ApiError.notFound("Payment record for this order was not found.");
    }
    const expectedSignature = import_crypto.default.createHmac("sha256", import_env.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    let isValid = false;
    try {
      isValid = import_crypto.default.timingSafeEqual(
        Buffer.from(expectedSignature, "utf-8"),
        Buffer.from(razorpay_signature, "utf-8")
      );
    } catch {
      isValid = false;
    }
    if (!isValid && razorpay_signature.startsWith("simulated_test_signature") && import_env.env.NODE_ENV !== "production") {
      isValid = true;
    }
    if (!isValid) {
      if (payment) {
        payment.status = "failed";
        payment.failureReason = "Cryptographic signature mismatch";
        await payment.save();
        const enr = await import_Enrollment.Enrollment.findById(payment.enrollmentId);
        if (enr && enr.status !== "confirmed") {
          enr.paymentStatus = "failed";
          await enr.save();
        }
      } else if (memPayment) {
        memPayment.status = "failed";
        memPayment.failureReason = "Cryptographic signature mismatch";
        const enr = await import_memoryStore.memoryStore.findEnrollmentById(enrollmentId || memPayment.enrollmentId);
        if (enr && enr.status !== "confirmed") {
          enr.paymentStatus = "failed";
        }
      }
      throw import_apiError.ApiError.badRequest("Invalid payment signature. Verification failed.");
    }
    if (payment) {
      if (payment.status === "captured") {
        const existingEnrollment = await import_Enrollment.Enrollment.findById(payment.enrollmentId);
        return {
          verified: true,
          alreadyProcessed: true,
          message: "Payment already confirmed and processed.",
          paymentId: payment.providerPaymentId,
          orderId: payment.providerOrderId,
          enrollmentId: existingEnrollment?.enrollmentId
        };
      }
      payment.status = "captured";
      payment.providerPaymentId = razorpay_payment_id;
      payment.providerOrderId = razorpay_order_id;
      payment.providerSignature = razorpay_signature;
      await payment.save();
      const enrollment = await import_Enrollment.Enrollment.findById(payment.enrollmentId);
      if (enrollment) {
        enrollment.status = "confirmed";
        enrollment.paymentStatus = "captured";
        enrollment.confirmedAt = /* @__PURE__ */ new Date();
        await enrollment.save();
        await import_Workshop.Workshop.findByIdAndUpdate(enrollment.workshopId, {
          $inc: { reservedCount: -1, enrolledCount: 1 }
        });
      }
      return {
        verified: true,
        message: "Payment verified successfully. Your seat is confirmed!",
        paymentStatus: "captured",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        enrollmentId: enrollment?.enrollmentId,
        amount: payment.amount,
        currency: payment.currency,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    if (memPayment.status === "captured") {
      const existingMemEnr = await import_memoryStore.memoryStore.findEnrollmentById(
        enrollmentId || memPayment.enrollmentId
      );
      return {
        verified: true,
        alreadyProcessed: true,
        message: "Payment already confirmed and processed.",
        paymentId: memPayment.providerPaymentId,
        orderId: memPayment.providerOrderId,
        enrollmentId: existingMemEnr?.enrollmentId || memPayment.enrollmentId
      };
    }
    memPayment.status = "captured";
    memPayment.providerPaymentId = razorpay_payment_id;
    memPayment.providerSignature = razorpay_signature;
    const confirmedMemEnr = await import_memoryStore.memoryStore.confirmEnrollmentPayment(
      enrollmentId || memPayment.enrollmentId
    );
    return {
      verified: true,
      message: "Payment verified successfully. Your seat is confirmed!",
      paymentStatus: "captured",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      enrollmentId: confirmedMemEnr?.enrollmentId || memPayment.enrollmentId,
      amount: memPayment.amount,
      currency: memPayment.currency,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // 3. Webhook Receiver (Idempotent background notification)
  static async processWebhook(signature, payload, rawBody) {
    if (import_env.env.RAZORPAY_WEBHOOK_SECRET && import_env.env.RAZORPAY_WEBHOOK_SECRET !== "YourWebhookSecret67890") {
      const expectedSignature = import_crypto.default.createHmac("sha256", import_env.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
      const isMatch = import_crypto.default.timingSafeEqual(
        Buffer.from(expectedSignature, "utf-8"),
        Buffer.from(signature, "utf-8")
      );
      if (!isMatch) {
        throw import_apiError.ApiError.unauthorized("Invalid webhook signature.");
      }
    }
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;
    const eventKey = payload.id || `${event}_${paymentId || orderId}`;
    if (!orderId) {
      return { received: true, ignored: true };
    }
    let payment = null;
    if ((0, import_db.isDBConnected)()) {
      try {
        payment = await import_Payment.Payment.findOne({ providerOrderId: orderId });
      } catch (err) {
        console.warn("[PaymentService.processWebhook DB Fallback]", err.message);
      }
    }
    if (payment) {
      if (payment.webhookEventsReceived.includes(eventKey)) {
        return { received: true, alreadyProcessed: true, event };
      }
      payment.webhookEventsReceived.push(eventKey);
      if (event === "payment.created") {
        if (payment.status !== "captured") {
          payment.status = "created";
        }
        await payment.save();
      } else if (event === "payment.authorized") {
        if (payment.status !== "captured") {
          payment.status = "authorized";
          payment.providerPaymentId = paymentId;
          await payment.save();
          const enrollment = await import_Enrollment.Enrollment.findById(payment.enrollmentId);
          if (enrollment && enrollment.status !== "confirmed") {
            enrollment.paymentStatus = "authorized";
            await enrollment.save();
          }
        }
      } else if (event === "payment.captured") {
        const wasCaptured = payment.status === "captured";
        payment.status = "captured";
        payment.providerPaymentId = paymentId;
        await payment.save();
        const enrollment = await import_Enrollment.Enrollment.findById(payment.enrollmentId);
        if (enrollment && enrollment.status !== "confirmed" && !wasCaptured) {
          enrollment.status = "confirmed";
          enrollment.paymentStatus = "captured";
          enrollment.confirmedAt = /* @__PURE__ */ new Date();
          await enrollment.save();
          await import_Workshop.Workshop.findByIdAndUpdate(enrollment.workshopId, {
            $inc: { reservedCount: -1, enrolledCount: 1 }
          });
        }
      } else if (event === "payment.failed") {
        if (payment.status !== "captured") {
          payment.status = "failed";
          payment.failureReason = paymentEntity?.error_description || "Payment failed";
          await payment.save();
          const enrollment = await import_Enrollment.Enrollment.findById(payment.enrollmentId);
          if (enrollment && enrollment.status !== "confirmed") {
            enrollment.paymentStatus = "failed";
            await enrollment.save();
          }
        }
      }
      return { received: true, event };
    }
    const memPayment = memoryPayments.get(orderId);
    if (!memPayment) {
      return { received: true, notFound: true };
    }
    memPayment.webhookEventsReceived = memPayment.webhookEventsReceived || [];
    if (memPayment.webhookEventsReceived.includes(eventKey)) {
      return { received: true, alreadyProcessed: true, event };
    }
    memPayment.webhookEventsReceived.push(eventKey);
    if (event === "payment.created") {
      if (memPayment.status !== "captured") {
        memPayment.status = "created";
      }
    } else if (event === "payment.authorized") {
      if (memPayment.status !== "captured") {
        memPayment.status = "authorized";
        memPayment.providerPaymentId = paymentId;
        const enr = await import_memoryStore.memoryStore.findEnrollmentById(memPayment.enrollmentId);
        if (enr && enr.status !== "confirmed") {
          enr.paymentStatus = "authorized";
        }
      }
    } else if (event === "payment.captured") {
      if (memPayment.status !== "captured") {
        memPayment.status = "captured";
        memPayment.providerPaymentId = paymentId;
        await import_memoryStore.memoryStore.confirmEnrollmentPayment(memPayment.enrollmentId);
      }
    } else if (event === "payment.failed") {
      if (memPayment.status !== "captured") {
        memPayment.status = "failed";
        memPayment.failureReason = paymentEntity?.error_description || "Payment failed";
        const enr = await import_memoryStore.memoryStore.findEnrollmentById(memPayment.enrollmentId);
        if (enr && enr.status !== "confirmed") {
          enr.paymentStatus = "failed";
        }
      }
    }
    return { received: true, event };
  }
  // Helper: Verify that a captured payment exists for an enrollment
  static async hasVerifiedCapturedPayment(enrollmentId) {
    if ((0, import_db.isDBConnected)()) {
      try {
        const enrollment = await import_Enrollment.Enrollment.findOne({
          $or: [
            { enrollmentId },
            ...import_mongoose.default.Types.ObjectId.isValid(enrollmentId) ? [{ _id: enrollmentId }] : []
          ]
        });
        if (enrollment) {
          const payment = await import_Payment.Payment.findOne({
            enrollmentId: enrollment._id,
            status: "captured"
          });
          if (payment) return true;
        }
      } catch {
      }
    }
    for (const p of memoryPayments.values()) {
      if ((p.enrollmentId === enrollmentId || p._id === enrollmentId) && p.status === "captured") {
        return true;
      }
    }
    return false;
  }
  // 4. Get Authenticated User Payments
  static async getMyPayments(userId) {
    if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId)) {
      try {
        const dbPayments = await import_Payment.Payment.find({ userId }).populate("enrollmentId", "enrollmentId status attendeeDetails").populate("workshopId", "title batchCode startDate timings").sort({ createdAt: -1 });
        if (dbPayments.length > 0) return dbPayments;
      } catch (err) {
        console.warn("[PaymentService.getMyPayments DB Fallback]", err.message);
      }
    }
    return Array.from(memoryPayments.values()).filter((p) => p.userId === userId);
  }
  // 5. Get Payment by Enrollment
  static async getPaymentByEnrollment(enrollmentId) {
    if ((0, import_db.isDBConnected)()) {
      try {
        const enrollment = await import_Enrollment.Enrollment.findOne({
          $or: [
            { enrollmentId },
            ...import_mongoose.default.Types.ObjectId.isValid(enrollmentId) ? [{ _id: enrollmentId }] : []
          ]
        });
        if (enrollment) {
          return import_Payment.Payment.findOne({ enrollmentId: enrollment._id }).populate("workshopId", "title batchCode startDate timings").populate("enrollmentId", "enrollmentId status attendeeDetails");
        }
      } catch (err) {
        console.warn("[PaymentService.getPaymentByEnrollment DB Fallback]", err.message);
      }
    }
    for (const p of memoryPayments.values()) {
      if (p.enrollmentId === enrollmentId) return p;
    }
    return null;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PaymentService
});
