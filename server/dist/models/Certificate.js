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
var Certificate_exports = {};
__export(Certificate_exports, {
  Certificate: () => Certificate
});
module.exports = __toCommonJS(Certificate_exports);
var import_mongoose = __toESM(require("mongoose"));
const CertificateSchema = new import_mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },
    enrollmentId: {
      type: import_mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
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
      required: true
    },
    recipientName: {
      type: String,
      required: true,
      trim: true
    },
    workshopTitle: {
      type: String,
      required: true
    },
    completionDate: {
      type: Date,
      default: Date.now
    },
    verificationHash: {
      type: String,
      required: true
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    revokedReason: String
  },
  {
    timestamps: true
  }
);
const Certificate = import_mongoose.default.model("Certificate", CertificateSchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Certificate
});
