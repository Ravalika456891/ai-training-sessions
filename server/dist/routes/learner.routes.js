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
var learner_routes_exports = {};
__export(learner_routes_exports, {
  default: () => learner_routes_default
});
module.exports = __toCommonJS(learner_routes_exports);
var import_express = require("express");
var import_learner_controller = require("../controllers/learner.controller.js");
var import_auth_middleware = require("../middleware/auth.middleware.js");
var import_enrollmentAccess_middleware = require("../middleware/enrollmentAccess.middleware.js");
const router = (0, import_express.Router)();
router.use(import_auth_middleware.authenticate);
router.get("/dashboard", import_learner_controller.LearnerController.getDashboard);
router.post("/enroll", import_learner_controller.LearnerController.enrollInWorkshop);
router.get("/submissions", import_learner_controller.LearnerController.getMySubmissions);
router.get("/certificates", import_learner_controller.LearnerController.getMyCertificates);
router.get("/payments", import_learner_controller.LearnerController.getPayments);
router.get("/progress", import_learner_controller.LearnerController.getProgress);
router.get(
  "/materials",
  (0, import_enrollmentAccess_middleware.requireVerifiedWorkshopAccess)({ resourceType: "material" }),
  import_learner_controller.LearnerController.getAuthorizedMaterials
);
router.get(
  "/workshops/:workshopId/materials",
  (0, import_enrollmentAccess_middleware.requireVerifiedWorkshopAccess)({ resourceType: "material" }),
  import_learner_controller.LearnerController.getAuthorizedMaterials
);
router.get(
  "/live-classes",
  (0, import_enrollmentAccess_middleware.requireVerifiedWorkshopAccess)({ resourceType: "live_class" }),
  import_learner_controller.LearnerController.getAuthorizedLiveClasses
);
router.get(
  "/workshops/:workshopId/live-classes",
  (0, import_enrollmentAccess_middleware.requireVerifiedWorkshopAccess)({ resourceType: "live_class" }),
  import_learner_controller.LearnerController.getAuthorizedLiveClasses
);
router.post(
  "/submissions",
  (0, import_enrollmentAccess_middleware.requireVerifiedWorkshopAccess)({ resourceType: "assignment" }),
  import_learner_controller.LearnerController.submitProject
);
router.get(
  "/certificates/download",
  (0, import_enrollmentAccess_middleware.requireVerifiedWorkshopAccess)({ resourceType: "certificate", requireCompletion: true }),
  import_learner_controller.LearnerController.downloadCertificate
);
router.get(
  "/workshops/:workshopId/certificate",
  (0, import_enrollmentAccess_middleware.requireVerifiedWorkshopAccess)({ resourceType: "certificate", requireCompletion: true }),
  import_learner_controller.LearnerController.downloadCertificate
);
var learner_routes_default = router;
