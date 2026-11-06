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
var routes_exports = {};
__export(routes_exports, {
  default: () => routes_default
});
module.exports = __toCommonJS(routes_exports);
var import_express = require("express");
var import_auth_routes = __toESM(require("./auth.routes.js"));
var import_workshop_routes = __toESM(require("./workshop.routes.js"));
var import_enrollment_routes = __toESM(require("./enrollment.routes.js"));
var import_payment_routes = __toESM(require("./payment.routes.js"));
var import_learner_routes = __toESM(require("./learner.routes.js"));
var import_admin_routes = __toESM(require("./admin.routes.js"));
var import_certificate_routes = __toESM(require("./certificate.routes.js"));
var import_registration_routes = __toESM(require("./registration.routes.js"));
var import_workshop_controller = require("../controllers/workshop.controller.js");
var import_enrollment_controller = require("../controllers/enrollment.controller.js");
var import_auth_middleware = require("../middleware/auth.middleware.js");
var import_validate_middleware = require("../middleware/validate.middleware.js");
var import_workshop_validator = require("../validators/workshop.validator.js");
const router = (0, import_express.Router)();
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Launchpad Backend API is running.",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
router.use("/auth", import_auth_routes.default);
router.use("/workshops", import_workshop_routes.default);
router.use("/enrollments", import_enrollment_routes.default);
router.use("/payments", import_payment_routes.default);
router.use("/learners", import_learner_routes.default);
router.use("/admin", import_admin_routes.default);
router.use("/certificates", import_certificate_routes.default);
router.use("/registrations", import_registration_routes.default);
router.post(
  "/admin/workshops",
  import_auth_middleware.authenticate,
  (0, import_auth_middleware.requireRole)("admin"),
  (0, import_validate_middleware.validateRequest)(import_workshop_validator.createWorkshopSchema),
  import_workshop_controller.WorkshopController.createWorkshop
);
router.patch(
  "/admin/workshops/:id",
  import_auth_middleware.authenticate,
  (0, import_auth_middleware.requireRole)("admin"),
  (0, import_validate_middleware.validateRequest)(import_workshop_validator.updateWorkshopSchema),
  import_workshop_controller.WorkshopController.updateWorkshop
);
router.get(
  "/admin/enrollments",
  import_auth_middleware.authenticate,
  (0, import_auth_middleware.requireRole)("admin"),
  import_enrollment_controller.EnrollmentController.getAllEnrollments
);
var routes_default = router;
