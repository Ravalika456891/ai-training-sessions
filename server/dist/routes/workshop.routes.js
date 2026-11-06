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
var workshop_routes_exports = {};
__export(workshop_routes_exports, {
  default: () => workshop_routes_default
});
module.exports = __toCommonJS(workshop_routes_exports);
var import_express = require("express");
var import_workshop_controller = require("../controllers/workshop.controller.js");
var import_auth_middleware = require("../middleware/auth.middleware.js");
var import_validate_middleware = require("../middleware/validate.middleware.js");
var import_workshop_validator = require("../validators/workshop.validator.js");
const router = (0, import_express.Router)();
router.get("/", import_workshop_controller.WorkshopController.getWorkshops);
router.get("/:id", import_workshop_controller.WorkshopController.getWorkshopById);
router.post(
  "/admin",
  import_auth_middleware.authenticate,
  (0, import_auth_middleware.requireRole)("admin"),
  (0, import_validate_middleware.validateRequest)(import_workshop_validator.createWorkshopSchema),
  import_workshop_controller.WorkshopController.createWorkshop
);
router.patch(
  "/admin/:id",
  import_auth_middleware.authenticate,
  (0, import_auth_middleware.requireRole)("admin"),
  (0, import_validate_middleware.validateRequest)(import_workshop_validator.updateWorkshopSchema),
  import_workshop_controller.WorkshopController.updateWorkshop
);
var workshop_routes_default = router;
