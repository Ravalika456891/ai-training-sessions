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
const router = (0, import_express.Router)();
router.use(import_auth_middleware.authenticate);
router.get("/dashboard", import_learner_controller.LearnerController.getDashboard);
router.post("/submissions", import_learner_controller.LearnerController.submitProject);
router.get("/submissions", import_learner_controller.LearnerController.getMySubmissions);
router.get("/certificates", import_learner_controller.LearnerController.getMyCertificates);
var learner_routes_default = router;
//# sourceMappingURL=learner.routes.js.map
