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
var enrollment_controller_exports = {};
__export(enrollment_controller_exports, {
  EnrollmentController: () => EnrollmentController
});
module.exports = __toCommonJS(enrollment_controller_exports);
var import_enrollment_service = require("../services/enrollment.service.js");
var import_jwt = require("../utils/jwt.js");
class EnrollmentController {
  static async register(req, res, next) {
    try {
      const result = await import_enrollment_service.EnrollmentService.registerLearner(
        req.body,
        req.user?._id?.toString()
      );
      if (result.token) {
        (0, import_jwt.setAuthCookie)(res, result.token);
      }
      res.status(201).json({
        success: true,
        message: result.paymentRequired ? "Registration recorded. Seat reserved for 15 minutes." : "Enrollment confirmed successfully!",
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  static async getMyEnrollments(req, res, next) {
    try {
      const enrollments = await import_enrollment_service.EnrollmentService.getLearnerEnrollments(
        req.user._id.toString()
      );
      res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments
      });
    } catch (error) {
      next(error);
    }
  }
  static async getAllEnrollments(_req, res, next) {
    try {
      const enrollments = await import_enrollment_service.EnrollmentService.getAllEnrollments();
      res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments
      });
    } catch (error) {
      next(error);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EnrollmentController
});
//# sourceMappingURL=enrollment.controller.js.map
