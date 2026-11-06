var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var payment_controller_exports = {};
__export(payment_controller_exports, {
  PaymentController: () => PaymentController
});
module.exports = __toCommonJS(payment_controller_exports);
var import_payment_service = require("../services/payment.service.js");
class PaymentController {
  static async createOrder(req, res, next) {
    try {
      const orderData = await import_payment_service.PaymentService.createOrder(
        req.body,
        req.user?._id?.toString()
      );
      res.status(200).json({
        success: true,
        message: "Razorpay order created successfully.",
        data: orderData
      });
    } catch (error) {
      next(error);
    }
  }
  static async verify(req, res, next) {
    try {
      const verification = await import_payment_service.PaymentService.verifyPayment(req.body);
      res.status(200).json({
        success: true,
        message: verification.message,
        data: verification
      });
    } catch (error) {
      next(error);
    }
  }
  static async webhook(req, res, next) {
    try {
      const signature = req.headers["x-razorpay-signature"] || "";
      const rawBody = req.rawBody || JSON.stringify(req.body);
      const result = await import_payment_service.PaymentService.processWebhook(signature, req.body, rawBody);
      res.status(200).json({
        status: "ok",
        result
      });
    } catch (error) {
      next(error);
    }
  }
  static async getMyPayments(req, res, next) {
    try {
      const payments = await import_payment_service.PaymentService.getMyPayments(req.user._id.toString());
      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments
      });
    } catch (error) {
      next(error);
    }
  }
  static async getPaymentByEnrollment(req, res, next) {
    try {
      const enrollmentId = Array.isArray(req.params.enrollmentId) ? req.params.enrollmentId[0] : req.params.enrollmentId;
      const payment = await import_payment_service.PaymentService.getPaymentByEnrollment(enrollmentId);
      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }
  static async validateCoupon(req, res, next) {
    try {
      const { couponCode, basePrice } = req.body;
      const result = import_payment_service.PaymentService.validateCoupon(couponCode, Number(basePrice) || 1999);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PaymentController
});
