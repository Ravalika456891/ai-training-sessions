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
var registration_routes_exports = {};
__export(registration_routes_exports, {
  default: () => registration_routes_default
});
module.exports = __toCommonJS(registration_routes_exports);
var import_express = require("express");
var import_registration_controller = require("../controllers/registration.controller.js");
var import_validate_middleware = require("../middleware/validate.middleware.js");
var import_registration_validator = require("../validators/registration.validator.js");
var import_rateLimit_middleware = require("../middleware/rateLimit.middleware.js");
const router = (0, import_express.Router)();
router.post(
  "/",
  import_rateLimit_middleware.registrationRateLimiter,
  (0, import_validate_middleware.validateRequest)(import_registration_validator.createRegistrationSchema),
  import_registration_controller.RegistrationController.createRegistration
);
router.get("/", import_registration_controller.RegistrationController.getRegistrations);
var registration_routes_default = router;
