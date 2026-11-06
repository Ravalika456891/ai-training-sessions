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
var Payment_exports = {};
__export(Payment_exports, {
  Payment: () => Payment
});
module.exports = __toCommonJS(Payment_exports);
var import_mongoose = __toESM(require("mongoose"));
const PaymentSchema = new import_mongoose.Schema(
  {
    userId: {
      type: import_mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
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
    amount: {
      type: Number,
      required: true
    },
    amountInPaise: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    provider: {
      type: String,
      enum: ["razorpay", "free_tier"],
      default: "razorpay"
    },
    providerPaymentId: {
      type: String,
      sparse: true,
      index: true
    },
    providerOrderId: {
      type: String,
      sparse: true,
      index: true
    },
    providerSignature: {
      type: String
    },
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "pending", "failed", "refunded"],
      default: "created",
      index: true
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true
    },
    webhookEventsReceived: {
      type: [String],
      default: []
    },
    failureReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);
const Payment = import_mongoose.default.model("Payment", PaymentSchema);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Payment
});
