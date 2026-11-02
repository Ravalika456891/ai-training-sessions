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
var Enrollment_exports = {};
__export(Enrollment_exports, {
  Enrollment: () => Enrollment
});
module.exports = __toCommonJS(Enrollment_exports);
var import_mongoose = __toESM(require("mongoose"));
const EnrollmentSchema = new import_mongoose.Schema(
  {
    enrollmentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: import_mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    workshopId: {
      type: import_mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "attended"],
      default: "pending",
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "free"],
      default: "pending",
      index: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    reservedUntil: {
      type: Date
    },
    attendeeDetails: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      userCategory: { type: String, default: "working_professional" },
      experienceLevel: { type: String, default: "beginner" }
    },
    utm: {
      source: String,
      medium: String,
      campaign: String
    }
  },
  {
    timestamps: true
  }
);
EnrollmentSchema.index({ userId: 1, workshopId: 1 }, { unique: true });
const Enrollment = import_mongoose.default.model("Enrollment", EnrollmentSchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Enrollment
});
//# sourceMappingURL=Enrollment.js.map
