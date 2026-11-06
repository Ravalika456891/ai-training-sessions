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
var PlatformSettings_exports = {};
__export(PlatformSettings_exports, {
  PlatformSettings: () => PlatformSettings
});
module.exports = __toCommonJS(PlatformSettings_exports);
var import_mongoose = __toESM(require("mongoose"));
const PlatformSettingsSchema = new import_mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global_settings",
      index: true
    },
    branding: {
      siteName: { type: String, default: "AI Launchpad" },
      tagline: { type: String, default: "2-Day Hands-On AI Bootcamp" },
      supportEmail: { type: String, default: "admissions@ailaunchpad.edu" },
      supportPhone: { type: String, default: "+91 98765 43210" },
      primaryColor: { type: String, default: "#2563EB" }
    },
    registration: {
      allowPublicRegistration: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: false },
      maxSeatsPerBatch: { type: Number, default: 60, min: 1 },
      reservationHoldMinutes: { type: Number, default: 15, min: 5 },
      waitlistEnabled: { type: Boolean, default: true }
    },
    workshopDefaults: {
      defaultBasePrice: { type: Number, default: 1999, min: 0 },
      defaultCurrency: { type: String, default: "INR" },
      defaultTaxPercentage: { type: Number, default: 18, min: 0, max: 100 },
      defaultTimezone: { type: String, default: "Asia/Kolkata (IST)" },
      defaultTimings: { type: String, default: "10:00 AM \u2013 3:00 PM IST" }
    },
    emailTemplates: {
      registrationConfirmationSubject: {
        type: String,
        default: "Welcome to AI Launchpad \u2014 Your Cohort Registration Details"
      },
      paymentReceiptSubject: {
        type: String,
        default: "Confirmed: Your AI Launchpad Bootcamp Seat & Payment Receipt"
      },
      certificateIssuedSubject: {
        type: String,
        default: "Congratulations! Your Official AI Launchpad Certificate is Ready"
      },
      reminderHoursBeforeSession: { type: Number, default: 24 }
    },
    instructorPermissions: {
      canMarkAttendance: { type: Boolean, default: true },
      canReviewSubmissions: { type: Boolean, default: true },
      canUploadMaterials: { type: Boolean, default: true },
      canViewStudentEmails: { type: Boolean, default: true }
    },
    notifications: {
      notifyAdminOnNewEnrollment: { type: Boolean, default: true },
      notifyAdminOnPaymentFailure: { type: Boolean, default: true },
      notifyStudentOnCertificateIssue: { type: Boolean, default: true }
    },
    updatedBy: { type: String }
  },
  {
    timestamps: true
  }
);
const PlatformSettings = import_mongoose.default.model(
  "PlatformSettings",
  PlatformSettingsSchema
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PlatformSettings
});
