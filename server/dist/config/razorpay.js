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
var razorpay_exports = {};
__export(razorpay_exports, {
  isRazorpayConfigured: () => isRazorpayConfigured,
  razorpayInstance: () => razorpayInstance
});
module.exports = __toCommonJS(razorpay_exports);
var import_env = require("./env.js");
let razorpayClient = null;
try {
  const Razorpay = require("razorpay");
  razorpayClient = new Razorpay({
    key_id: import_env.env.RAZORPAY_KEY_ID,
    key_secret: import_env.env.RAZORPAY_KEY_SECRET
  });
} catch {
  razorpayClient = {
    orders: {
      create: async (params) => ({
        id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        ...params
      })
    }
  };
}
const razorpayInstance = razorpayClient;
const isRazorpayConfigured = () => {
  return Boolean(import_env.env.RAZORPAY_KEY_ID) && Boolean(import_env.env.RAZORPAY_KEY_SECRET) && import_env.env.RAZORPAY_KEY_ID !== "rzp_test_YourTestKeyId";
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isRazorpayConfigured,
  razorpayInstance
});
//# sourceMappingURL=razorpay.js.map
