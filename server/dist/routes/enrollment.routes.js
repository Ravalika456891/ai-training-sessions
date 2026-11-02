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
var enrollment_routes_exports = {};
__export(enrollment_routes_exports, {
  default: () => enrollment_routes_default
});
module.exports = __toCommonJS(enrollment_routes_exports);
var import_express = require("express");
var import_enrollment_controller = require("../controllers/enrollment.controller.js");
var import_auth_middleware = require("../middleware/auth.middleware.js");
var import_validate_middleware = require("../middleware/validate.middleware.js");
var import_rateLimit_middleware = require("../middleware/rateLimit.middleware.js");
var import_enrollment_validator = require("../validators/enrollment.validator.js");
const router = (0, import_express.Router)();
router.post(
  "/",
  import_rateLimit_middleware.enrollmentRateLimiter,
  import_auth_middleware.optionalAuthenticate,
  (0, import_validate_middleware.validateRequest)(import_enrollment_validator.createEnrollmentSchema),
  import_enrollment_controller.EnrollmentController.register
);
router.get("/me", import_auth_middleware.authenticate, import_enrollment_controller.EnrollmentController.getMyEnrollments);
router.get("/admin", import_auth_middleware.authenticate, (0, import_auth_middleware.requireRole)("admin"), import_enrollment_controller.EnrollmentController.getAllEnrollments);
var enrollment_routes_default = router;
//# sourceMappingURL=enrollment.routes.js.map
