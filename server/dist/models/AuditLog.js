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
var AuditLog_exports = {};
__export(AuditLog_exports, {
  AuditLog: () => AuditLog
});
module.exports = __toCommonJS(AuditLog_exports);
var import_mongoose = __toESM(require("mongoose"));
const AuditLogSchema = new import_mongoose.Schema(
  {
    actorId: {
      type: String,
      required: true,
      index: true
    },
    actorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    actorRole: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    entityType: {
      type: String,
      enum: ["user", "workshop", "session", "enrollment", "payment", "certificate", "content", "settings", "instructor"],
      required: true,
      index: true
    },
    entityId: {
      type: String,
      index: true
    },
    summary: {
      type: String,
      required: true
    },
    metadata: {
      type: import_mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);
AuditLogSchema.index({ createdAt: -1 });
const AuditLog = import_mongoose.default.model("AuditLog", AuditLogSchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuditLog
});
