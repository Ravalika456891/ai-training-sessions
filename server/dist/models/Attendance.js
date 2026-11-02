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
var Attendance_exports = {};
__export(Attendance_exports, {
  Attendance: () => Attendance
});
module.exports = __toCommonJS(Attendance_exports);
var import_mongoose = __toESM(require("mongoose"));
const AttendanceSchema = new import_mongoose.Schema(
  {
    enrollmentId: {
      type: import_mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
      index: true
    },
    workshopId: {
      type: import_mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
      index: true
    },
    userId: {
      type: import_mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    dayNumber: {
      type: Number,
      required: true,
      enum: [1, 2]
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present"
    },
    markedBy: {
      type: import_mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    markedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);
AttendanceSchema.index({ enrollmentId: 1, dayNumber: 1 }, { unique: true });
const Attendance = import_mongoose.default.model("Attendance", AttendanceSchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Attendance
});
//# sourceMappingURL=Attendance.js.map
