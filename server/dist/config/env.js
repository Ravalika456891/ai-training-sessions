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
var env_exports = {};
__export(env_exports, {
  env: () => env
});
module.exports = __toCommonJS(env_exports);
var import_dotenv = __toESM(require("dotenv"));
var import_path = __toESM(require("path"));
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env") });
const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai_launchpad",
  JWT_SECRET: process.env.JWT_SECRET || "fallback_development_secret_do_not_use_in_prod_12345",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  COOKIE_NAME: process.env.COOKIE_NAME || "ai_launchpad_token",
  ADMIN_NAME: process.env.ADMIN_NAME || "System Administrator",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@ailaunchpad.edu",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "AdminLaunchpad2026!",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_test_YourTestKeyId",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "YourTestKeySecret12345",
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "YourWebhookSecret67890",
  isProduction: process.env.NODE_ENV === "production"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  env
});
//# sourceMappingURL=env.js.map
