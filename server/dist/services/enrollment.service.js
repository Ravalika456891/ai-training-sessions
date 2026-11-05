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
var enrollment_service_exports = {};
__export(enrollment_service_exports, {
  EnrollmentService: () => EnrollmentService
});
module.exports = __toCommonJS(enrollment_service_exports);
var import_mongoose = __toESM(require("mongoose"));
var import_Enrollment = require("../models/Enrollment.js");
var import_Workshop = require("../models/Workshop.js");
var import_User = require("../models/User.js");
var import_Payment = require("../models/Payment.js");
var import_apiError = require("../utils/apiError.js");
var import_jwt = require("../utils/jwt.js");
var import_db = require("../config/db.js");
var import_memoryStore = require("./memoryStore.js");
class EnrollmentService {
  static async registerLearner(input, currentUserId) {
    const email = input.email.toLowerCase().trim();
    let workshop = null;
    if ((0, import_db.isDBConnected)()) {
      try {
        if (import_mongoose.default.Types.ObjectId.isValid(input.workshopId)) {
          workshop = await import_Workshop.Workshop.findById(input.workshopId);
        }
        if (!workshop) {
          workshop = await import_Workshop.Workshop.findOne({
            $or: [{ batchCode: input.workshopId }, { slug: input.workshopId }]
          });
        }
      } catch (err) {
        console.warn("[MongoDB Workshop Lookup]", err.message);
      }
    }
    if (!workshop) {
      workshop = await import_memoryStore.memoryStore.findWorkshop(input.workshopId);
    }
    if (!workshop) {
      throw import_apiError.ApiError.notFound("Selected workshop cohort was not found.");
    }
    let user = null;
    let autoCreatedToken;
    if ((0, import_db.isDBConnected)()) {
      try {
        if (currentUserId && import_mongoose.default.Types.ObjectId.isValid(currentUserId)) {
          user = await import_User.User.findById(currentUserId);
        }
        if (!user) {
          user = await import_User.User.findOne({ email });
          if (!user) {
            user = await import_User.User.create({
              name: input.fullName,
              email,
              phone: {
                countryCode: input.phoneCountryCode,
                number: input.phoneNumber
              },
              role: "learner",
              userCategory: input.userCategory,
              experienceLevel: input.experienceLevel,
              marketingConsent: input.marketingConsent || false
            });
            autoCreatedToken = (0, import_jwt.signToken)({
              userId: user._id.toString(),
              email: user.email,
              role: user.role
            });
          }
        }
      } catch (err) {
        console.warn("[MongoDB User Creation in Enrollment]", err.message);
      }
    }
    if (!user) {
      if (currentUserId) {
        user = await import_memoryStore.memoryStore.findUserById(currentUserId);
      }
      if (!user) {
        user = await import_memoryStore.memoryStore.findUserByEmail(email);
      }
      if (!user) {
        user = await import_memoryStore.memoryStore.createUser({
          name: input.fullName,
          email,
          phone: {
            countryCode: input.phoneCountryCode,
            number: input.phoneNumber
          },
          role: "learner",
          userCategory: input.userCategory,
          experienceLevel: input.experienceLevel,
          marketingConsent: input.marketingConsent
        });
        autoCreatedToken = (0, import_jwt.signToken)({
          userId: user._id,
          email: user.email,
          role: user.role
        });
      }
    }
    const isFree = Boolean(workshop.price?.isFree || workshop.price?.basePrice === 0);
    const basePrice = workshop.price?.basePrice || 1999;
    const taxPercentage = workshop.price?.taxPercentage || 18;
    const taxAmount = isFree ? 0 : Math.round(basePrice * (taxPercentage / 100));
    const totalAmount = isFree ? 0 : basePrice + taxAmount;
    const currency = workshop.price?.currency || "INR";
    let enrollment = null;
    if ((0, import_db.isDBConnected)() && user._id && import_mongoose.default.Types.ObjectId.isValid(user._id.toString()) && workshop._id && import_mongoose.default.Types.ObjectId.isValid(workshop._id.toString())) {
      try {
        const randomSuffix = Math.floor(1e3 + Math.random() * 9e3);
        const enrollmentId = `ENR-${(/* @__PURE__ */ new Date()).getFullYear()}-${randomSuffix}`;
        const reservedUntil = isFree ? void 0 : new Date(Date.now() + 15 * 60 * 1e3);
        enrollment = await import_Enrollment.Enrollment.create({
          enrollmentId,
          userId: user._id,
          workshopId: workshop._id,
          status: isFree ? "confirmed" : "pending",
          paymentStatus: isFree ? "free" : "pending",
          reservedUntil,
          attendeeDetails: {
            fullName: input.fullName,
            email,
            phone: `${input.phoneCountryCode} ${input.phoneNumber}`,
            userCategory: input.userCategory,
            experienceLevel: input.experienceLevel
          },
          utm: input.utm
        });
        if (!isFree) {
          await import_Payment.Payment.create({
            userId: user._id,
            enrollmentId: enrollment._id,
            amount: totalAmount,
            currency,
            provider: "razorpay",
            status: "pending",
            taxAmount
          });
        }
      } catch (dbErr) {
        console.warn("[MongoDB Enrollment Creation Fallback]", dbErr.message);
      }
    }
    if (!enrollment) {
      enrollment = await import_memoryStore.memoryStore.createEnrollment({
        userId: user._id.toString(),
        workshopId: workshop._id.toString(),
        attendeeDetails: {
          fullName: input.fullName,
          email,
          phone: `${input.phoneCountryCode} ${input.phoneNumber}`
        },
        paymentStatus: isFree ? "completed" : "pending"
      });
    }
    return {
      enrollment: {
        _id: enrollment._id.toString(),
        enrollmentId: enrollment.enrollmentId,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        reservedUntil: enrollment.reservedUntil,
        attendeeDetails: enrollment.attendeeDetails,
        enrolledAt: enrollment.enrolledAt || enrollment.createdAt || /* @__PURE__ */ new Date()
      },
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      },
      workshop: {
        _id: workshop._id.toString(),
        title: workshop.title,
        batchCode: workshop.batchCode,
        startDate: workshop.startDate,
        endDate: workshop.endDate,
        timings: workshop.timings,
        timezone: workshop.timezone,
        availableSeats: workshop.availableSeats || 24
      },
      token: autoCreatedToken,
      paymentRequired: !isFree,
      orderSummary: {
        basePrice,
        taxAmount,
        totalAmount,
        currency
      }
    };
  }
  static async getLearnerEnrollments(userId) {
    if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId)) {
      try {
        const enrollments = await import_Enrollment.Enrollment.find({ userId }).populate("workshopId", "title batchCode startDate endDate timings timezone instructor price").sort({ createdAt: -1 });
        if (enrollments && enrollments.length > 0) {
          return enrollments;
        }
      } catch (err) {
        console.warn("[MongoDB getLearnerEnrollments]", err.message);
      }
    }
    return import_memoryStore.memoryStore.getEnrollmentsByUserId(userId);
  }
  static async getAllEnrollments() {
    if ((0, import_db.isDBConnected)()) {
      try {
        const enrollments = await import_Enrollment.Enrollment.find().populate("userId", "name email phone role").populate("workshopId", "title batchCode startDate capacity enrolledCount").sort({ createdAt: -1 });
        if (enrollments && enrollments.length > 0) {
          return enrollments;
        }
      } catch (err) {
        console.warn("[MongoDB getAllEnrollments]", err.message);
      }
    }
    return import_memoryStore.memoryStore.getAllEnrollments();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EnrollmentService
});
//# sourceMappingURL=enrollment.service.js.map
