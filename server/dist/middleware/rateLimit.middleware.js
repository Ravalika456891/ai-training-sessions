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
var rateLimit_middleware_exports = {};
__export(rateLimit_middleware_exports, {
  apiRateLimiter: () => apiRateLimiter,
  authRateLimiter: () => authRateLimiter,
  enrollmentRateLimiter: () => enrollmentRateLimiter,
  registrationRateLimiter: () => registrationRateLimiter
});
module.exports = __toCommonJS(rateLimit_middleware_exports);
var import_express_rate_limit = __toESM(require("express-rate-limit"));
const apiRateLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 200,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});
const authRateLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 30,
  message: {
    success: false,
    message: "Too many login or registration attempts. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});
const enrollmentRateLimiter = (0, import_express_rate_limit.default)({
  windowMs: 60 * 60 * 1e3,
  max: 30,
  message: {
    success: false,
    message: "Too many registration requests. Please slow down and try again."
  },
  standardHeaders: true,
  legacyHeaders: false
});
const registrationRateLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  max: 15,
  message: {
    success: false,
    message: "Too many registration attempts from this network. Please wait a few minutes before trying again."
  },
  standardHeaders: true,
  legacyHeaders: false
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  apiRateLimiter,
  authRateLimiter,
  enrollmentRateLimiter,
  registrationRateLimiter
});
//# sourceMappingURL=rateLimit.middleware.js.map
