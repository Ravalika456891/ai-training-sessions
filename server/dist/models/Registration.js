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
var Registration_exports = {};
__export(Registration_exports, {
  Registration: () => Registration
});
module.exports = __toCommonJS(Registration_exports);
var import_mongoose = __toESM(require("mongoose"));
const registrationSchema = new import_mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
      index: true
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    batchId: {
      type: String,
      required: [true, "Training batch ID is required"],
      trim: true,
      index: true
    },
    registrationStatus: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "confirmed"
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "waived"],
      default: "unpaid"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);
registrationSchema.index({ email: 1, batchId: 1 }, { unique: true });
const Registration = import_mongoose.default.model("Registration", registrationSchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Registration
});
//# sourceMappingURL=Registration.js.map
