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
var workshop_controller_exports = {};
__export(workshop_controller_exports, {
  WorkshopController: () => WorkshopController
});
module.exports = __toCommonJS(workshop_controller_exports);
var import_workshop_service = require("../services/workshop.service.js");
class WorkshopController {
  static async getWorkshops(_req, res, next) {
    try {
      const workshops = await import_workshop_service.WorkshopService.getPublishedWorkshops();
      res.status(200).json({
        success: true,
        count: workshops.length,
        data: workshops
      });
    } catch (error) {
      next(error);
    }
  }
  static async getWorkshopById(req, res, next) {
    try {
      const workshopId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const workshop = await import_workshop_service.WorkshopService.getWorkshopById(workshopId);
      res.status(200).json({
        success: true,
        data: workshop
      });
    } catch (error) {
      next(error);
    }
  }
  static async createWorkshop(req, res, next) {
    try {
      const workshop = await import_workshop_service.WorkshopService.createWorkshop(req.body);
      res.status(201).json({
        success: true,
        message: "Workshop created successfully.",
        data: workshop
      });
    } catch (error) {
      next(error);
    }
  }
  static async updateWorkshop(req, res, next) {
    try {
      const workshopId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const workshop = await import_workshop_service.WorkshopService.updateWorkshop(workshopId, req.body);
      res.status(200).json({
        success: true,
        message: "Workshop updated successfully.",
        data: workshop
      });
    } catch (error) {
      next(error);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WorkshopController
});
//# sourceMappingURL=workshop.controller.js.map
