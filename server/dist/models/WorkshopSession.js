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
var WorkshopSession_exports = {};
__export(WorkshopSession_exports, {
  WorkshopSession: () => WorkshopSession
});
module.exports = __toCommonJS(WorkshopSession_exports);
var import_mongoose = __toESM(require("mongoose"));
const WorkshopSessionSchema = new import_mongoose.Schema(
  {
    workshopId: {
      type: import_mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
      index: true
    },
    batchId: {
      type: String,
      trim: true,
      index: true
    },
    batchCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    instructorId: {
      type: String,
      trim: true,
      index: true
    },
    dayNumber: {
      type: Number,
      default: 1
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    sessionDate: {
      type: Date,
      required: true,
      index: true
    },
    startAt: {
      type: Date,
      required: true,
      index: true
    },
    endAt: {
      type: Date,
      required: true,
      index: true
    },
    durationMinutes: {
      type: Number,
      default: 120,
      min: 15
    },
    startTime: {
      type: String,
      default: "10:00 AM"
    },
    endTime: {
      type: String,
      default: "12:00 PM"
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata"
    },
    instructorName: {
      type: String,
      required: true,
      trim: true
    },
    instructorEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    classType: {
      type: String,
      enum: ["live", "recorded", "hybrid"],
      default: "live",
      index: true
    },
    meetingProvider: {
      type: String,
      enum: ["google_meet", "zoom", "teams", "custom"],
      default: "google_meet"
    },
    liveSessionUrl: {
      type: String,
      required: true,
      trim: true
    },
    encryptedMeetingUrl: {
      type: String,
      trim: true
    },
    meetingPasscode: {
      type: String,
      trim: true
    },
    visibility: {
      type: String,
      enum: ["enrolled_only", "public_preview"],
      default: "enrolled_only"
    },
    capacity: {
      type: Number,
      default: 60,
      min: 1
    },
    maxAttendees: {
      type: Number,
      default: 60,
      min: 1
    },
    registrationDeadline: {
      type: Date
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
      index: true
    },
    recurrenceSeriesId: {
      type: String,
      trim: true,
      index: true
    },
    recurrenceRule: {
      frequency: {
        type: String,
        enum: ["none", "daily", "weekly", "weekdays"],
        default: "none"
      },
      daysOfWeek: [Number],
      untilDate: String
    },
    cancellationReason: {
      type: String,
      trim: true
    },
    createdBy: {
      type: String,
      trim: true
    },
    updatedBy: {
      type: String,
      trim: true
    },
    changeHistory: [
      {
        action: String,
        summary: String,
        actorEmail: String,
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);
WorkshopSessionSchema.index({ workshopId: 1, startAt: 1 });
WorkshopSessionSchema.index({ batchCode: 1, startAt: 1 });
WorkshopSessionSchema.index({ instructorId: 1, startAt: 1 });
const WorkshopSession = import_mongoose.default.model(
  "WorkshopSession",
  WorkshopSessionSchema
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WorkshopSession
});
