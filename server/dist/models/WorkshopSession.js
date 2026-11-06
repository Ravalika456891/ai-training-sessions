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
    batchCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    dayNumber: {
      type: Number,
      enum: [1, 2],
      required: true
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
    startTime: {
      type: String,
      default: "10:00 AM"
    },
    endTime: {
      type: String,
      default: "3:00 PM"
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata (IST)"
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
    liveSessionUrl: {
      type: String,
      required: true,
      trim: true
    },
    meetingPasscode: {
      type: String,
      trim: true
    },
    capacity: {
      type: Number,
      default: 60,
      min: 1
    },
    registrationDeadline: {
      type: Date
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
      index: true
    }
  },
  {
    timestamps: true
  }
);
WorkshopSessionSchema.index({ workshopId: 1, dayNumber: 1 }, { unique: true });
const WorkshopSession = import_mongoose.default.model(
  "WorkshopSession",
  WorkshopSessionSchema
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WorkshopSession
});
