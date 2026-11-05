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
var registration_controller_exports = {};
__export(registration_controller_exports, {
  RegistrationController: () => RegistrationController
});
module.exports = __toCommonJS(registration_controller_exports);
var import_registration_service = require("../services/registration.service.js");
class RegistrationController {
  /**
   * POST /api/registrations
   * Register a participant for a training batch
   */
  static async createRegistration(req, res, next) {
    try {
      const result = await import_registration_service.RegistrationService.createRegistration(req.body);
      res.status(201).json({
        success: true,
        message: "Registration confirmed successfully! A confirmation email has been dispatched.",
        data: result.registration,
        emailDispatched: result.emailDispatched
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET /api/registrations
   * Retrieve participant registrations (filterable by email or batchId)
   */
  static async getRegistrations(req, res, next) {
    try {
      const email = typeof req.query.email === "string" ? req.query.email : void 0;
      const batchId = typeof req.query.batchId === "string" ? req.query.batchId : void 0;
      const registrations = await import_registration_service.RegistrationService.getRegistrations({ email, batchId });
      res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations
      });
    } catch (error) {
      next(error);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RegistrationController
});
//# sourceMappingURL=registration.controller.js.map
