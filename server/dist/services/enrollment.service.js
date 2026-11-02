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
class EnrollmentService {
  static async registerLearner(input, currentUserId) {
    let workshop = await import_Workshop.Workshop.findById(input.workshopId);
    if (!workshop) {
      workshop = await import_Workshop.Workshop.findOne({
        $or: [{ batchCode: input.workshopId }, { slug: input.workshopId }]
      });
    }
    if (!workshop) {
      throw import_apiError.ApiError.notFound("Selected workshop cohort was not found.");
    }
    if (workshop.status !== "published") {
      throw import_apiError.ApiError.badRequest("This workshop cohort is not currently open for registration.");
    }
    let user = null;
    let autoCreatedToken;
    if (currentUserId && import_mongoose.default.Types.ObjectId.isValid(currentUserId)) {
      user = await import_User.User.findById(currentUserId);
    }
    if (!user) {
      user = await import_User.User.findOne({ email: input.email.toLowerCase() });
      if (!user) {
        user = await import_User.User.create({
          name: input.fullName,
          email: input.email.toLowerCase(),
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
    const existingEnrollment = await import_Enrollment.Enrollment.findOne({
      userId: user._id,
      workshopId: workshop._id,
      status: { $in: ["pending", "confirmed", "attended"] }
    });
    if (existingEnrollment) {
      throw import_apiError.ApiError.conflict(
        `You already have an active registration (${existingEnrollment.enrollmentId}) for this cohort.`
      );
    }
    const isFree = workshop.price.isFree || workshop.price.basePrice === 0;
    const seatFieldToIncrement = isFree ? "enrolledCount" : "reservedCount";
    const updatedWorkshop = await import_Workshop.Workshop.findOneAndUpdate(
      {
        _id: workshop._id,
        status: "published",
        $expr: {
          $lt: [
            { $add: ["$enrolledCount", "$reservedCount"] },
            "$capacity"
          ]
        }
      },
      {
        $inc: { [seatFieldToIncrement]: 1 }
      },
      { new: true }
    );
    if (!updatedWorkshop) {
      throw import_apiError.ApiError.conflict("Sorry, this workshop cohort has reached maximum capacity.");
    }
    const randomSuffix = Math.floor(1e3 + Math.random() * 9e3);
    const enrollmentId = `ENR-${(/* @__PURE__ */ new Date()).getFullYear()}-${randomSuffix}`;
    const basePrice = workshop.price.basePrice;
    const taxPercentage = workshop.price.taxPercentage || 18;
    const taxAmount = isFree ? 0 : Math.round(basePrice * (taxPercentage / 100));
    const totalAmount = isFree ? 0 : basePrice + taxAmount;
    const reservedUntil = isFree ? void 0 : new Date(Date.now() + 15 * 60 * 1e3);
    const enrollment = await import_Enrollment.Enrollment.create({
      enrollmentId,
      userId: user._id,
      workshopId: workshop._id,
      status: isFree ? "confirmed" : "pending",
      paymentStatus: isFree ? "free" : "pending",
      reservedUntil,
      attendeeDetails: {
        fullName: input.fullName,
        email: input.email.toLowerCase(),
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
        currency: workshop.price.currency || "INR",
        provider: "razorpay",
        status: "pending",
        taxAmount
      });
    }
    return {
      enrollment,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      workshop: {
        _id: updatedWorkshop._id,
        title: updatedWorkshop.title,
        batchCode: updatedWorkshop.batchCode,
        startDate: updatedWorkshop.startDate,
        endDate: updatedWorkshop.endDate,
        timings: updatedWorkshop.timings,
        timezone: updatedWorkshop.timezone,
        availableSeats: updatedWorkshop.availableSeats
      },
      token: autoCreatedToken,
      paymentRequired: !isFree,
      orderSummary: {
        basePrice,
        taxAmount,
        totalAmount,
        currency: workshop.price.currency || "INR"
      }
    };
  }
  static async getLearnerEnrollments(userId) {
    return import_Enrollment.Enrollment.find({ userId }).populate("workshopId", "title batchCode startDate endDate timings timezone instructor price").sort({ createdAt: -1 });
  }
  static async getAllEnrollments() {
    return import_Enrollment.Enrollment.find().populate("userId", "name email phone role").populate("workshopId", "title batchCode startDate capacity enrolledCount").sort({ createdAt: -1 });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EnrollmentService
});
//# sourceMappingURL=enrollment.service.js.map
