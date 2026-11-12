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
var Workshop_exports = {};
__export(Workshop_exports, {
  Workshop: () => Workshop
});
module.exports = __toCommonJS(Workshop_exports);
var import_mongoose = __toESM(require("mongoose"));
const WorkshopSchema = new import_mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Workshop title is required"],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    batchCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    description: {
      type: String,
      required: [true, "Workshop description is required"]
    },
    instructor: {
      name: { type: String, required: true },
      role: { type: String, required: true },
      bio: { type: String, required: true },
      avatarUrl: { type: String, required: true }
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"]
    },
    timings: {
      type: String,
      default: "10:00 AM \u2013 3:00 PM IST"
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata (IST)"
    },
    capacity: {
      type: Number,
      required: [true, "Workshop capacity is required"],
      min: [1, "Capacity must be at least 1"]
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0
    },
    reservedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    price: {
      basePrice: { type: Number, required: true, default: 1999 },
      currency: { type: String, default: "INR" },
      taxPercentage: { type: Number, default: 18 },
      isFree: { type: Boolean, default: false }
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived", "completed"],
      default: "draft",
      index: true
    },
    thumbnailUrl: {
      type: String,
      trim: true
    },
    registrationDeadline: {
      type: Date
    },
    liveSessionUrl: {
      type: String,
      trim: true
    },
    meetingPasscode: {
      type: String,
      trim: true
    },
    day1Session: {
      title: { type: String, default: "Day 1: LLM Foundations, Prompt Engineering & Custom Assistants" },
      startTime: { type: String, default: "10:00 AM IST" },
      endTime: { type: String, default: "3:00 PM IST" },
      liveUrl: { type: String, default: "https://meet.jit.si/AILaunchpad-AILP-Cohort-Day1" },
      instructorName: { type: String }
    },
    day2Session: {
      title: { type: String, default: "Day 2: Multi-Step AI Workflows, Prototypes & Deployment" },
      startTime: { type: String, default: "10:00 AM IST" },
      endTime: { type: String, default: "3:00 PM IST" },
      liveUrl: { type: String, default: "https://meet.jit.si/AILaunchpad-AILP-Cohort-Day2" },
      instructorName: { type: String }
    },
    curriculum: { type: [import_mongoose.Schema.Types.Mixed], default: [] },
    learningOutcomes: { type: [import_mongoose.Schema.Types.Mixed], default: [] },
    aiTools: { type: [import_mongoose.Schema.Types.Mixed], default: [] },
    faqs: { type: [import_mongoose.Schema.Types.Mixed], default: [] }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
WorkshopSchema.virtual("availableSeats").get(function() {
  const seats = this.capacity - (this.enrolledCount + this.reservedCount);
  return Math.max(0, seats);
});
WorkshopSchema.index({ status: 1, startDate: 1 });
const Workshop = import_mongoose.default.model("Workshop", WorkshopSchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Workshop
});
