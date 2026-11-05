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
var auth_routes_exports = {};
__export(auth_routes_exports, {
  default: () => auth_routes_default
});
module.exports = __toCommonJS(auth_routes_exports);
var import_express = require("express");
var import_auth_controller = require("../controllers/auth.controller.js");
var import_auth_middleware = require("../middleware/auth.middleware.js");
var import_validate_middleware = require("../middleware/validate.middleware.js");
var import_rateLimit_middleware = require("../middleware/rateLimit.middleware.js");
var import_auth_validator = require("../validators/auth.validator.js");
const router = (0, import_express.Router)();
router.post(
  "/register",
  import_rateLimit_middleware.authRateLimiter,
  (0, import_validate_middleware.validateRequest)(import_auth_validator.registerSchema),
  import_auth_controller.AuthController.register
);
router.post(
  "/login",
  import_rateLimit_middleware.authRateLimiter,
  (0, import_validate_middleware.validateRequest)(import_auth_validator.loginSchema),
  import_auth_controller.AuthController.login
);
router.post("/google", import_rateLimit_middleware.authRateLimiter, import_auth_controller.AuthController.googleAuth);
router.post("/logout", import_auth_controller.AuthController.logout);
router.get("/me", import_auth_middleware.authenticate, import_auth_controller.AuthController.getMe);
var auth_routes_default = router;
//# sourceMappingURL=auth.routes.js.map
