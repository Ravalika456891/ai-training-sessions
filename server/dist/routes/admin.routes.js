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
var admin_routes_exports = {};
__export(admin_routes_exports, {
  default: () => admin_routes_default
});
module.exports = __toCommonJS(admin_routes_exports);
var import_express = require("express");
var import_admin_controller = require("../controllers/admin.controller.js");
var import_auth_middleware = require("../middleware/auth.middleware.js");
const router = (0, import_express.Router)();
router.use(import_auth_middleware.authenticate);
router.get("/metrics", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.getMetrics);
router.get("/roster/:workshopId", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.getRoster);
router.post("/attendance", (0, import_auth_middleware.requireRole)("admin", "instructor"), import_admin_controller.AdminController.markAttendance);
router.post("/certificates/issue", (0, import_auth_middleware.requireRole)("admin"), import_admin_controller.AdminController.issueCertificate);
var admin_routes_default = router;
//# sourceMappingURL=admin.routes.js.map
