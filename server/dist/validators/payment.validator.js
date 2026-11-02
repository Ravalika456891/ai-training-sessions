var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var payment_validator_exports = {};
__export(payment_validator_exports, {
  createOrderSchema: () => createOrderSchema,
  validateCouponSchema: () => validateCouponSchema,
  verifyPaymentSchema: () => verifyPaymentSchema
});
module.exports = __toCommonJS(payment_validator_exports);
var import_zod = require("zod");
const createOrderSchema = import_zod.z.object({
  enrollmentId: import_zod.z.string().min(1, "Enrollment ID is required"),
  couponCode: import_zod.z.string().trim().toUpperCase().optional()
});
const verifyPaymentSchema = import_zod.z.object({
  razorpay_order_id: import_zod.z.string().min(1, "Razorpay Order ID is required"),
  razorpay_payment_id: import_zod.z.string().min(1, "Razorpay Payment ID is required"),
  razorpay_signature: import_zod.z.string().min(1, "Razorpay Signature is required"),
  enrollmentId: import_zod.z.string().min(1, "Enrollment ID is required")
});
const validateCouponSchema = import_zod.z.object({
  couponCode: import_zod.z.string().min(1, "Coupon code is required").trim().toUpperCase(),
  workshopId: import_zod.z.string().min(1, "Workshop ID is required")
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createOrderSchema,
  validateCouponSchema,
  verifyPaymentSchema
});
//# sourceMappingURL=payment.validator.js.map
