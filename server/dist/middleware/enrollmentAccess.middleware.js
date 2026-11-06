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
var enrollmentAccess_middleware_exports = {};
__export(enrollmentAccess_middleware_exports, {
  requireVerifiedWorkshopAccess: () => requireVerifiedWorkshopAccess
});
module.exports = __toCommonJS(enrollmentAccess_middleware_exports);
var import_apiError = require("../utils/apiError.js");
var import_learner_controller = require("../controllers/learner.controller.js");
var import_LearningResource = require("../models/LearningResource.js");
var import_db = require("../config/db.js");
var import_memoryStore = require("../services/memoryStore.js");
const requireVerifiedWorkshopAccess = (options = {}) => {
  return async (req, _res, next) => {
    try {
      if (!req.user || !req.user._id) {
        throw import_apiError.ApiError.unauthorized("Authentication required. Please sign in to continue.");
      }
      const userId = req.user._id.toString();
      const userEmail = req.user.email;
      const studentWorkshops = await import_learner_controller.LearnerController.getStudentWorkshops(userId, userEmail);
      const requestedTarget = req.params?.workshopId || req.query?.workshopId || req.body?.workshopId || req.body?.enrollmentId || "";
      const verifiedEnrollments = studentWorkshops.filter((w) => {
        const isConfirmedStatus = w.status === "confirmed" || w.status === "completed" || w.status === "attended";
        const isCapturedPayment = w.paymentStatus === "captured" || w.paymentStatus === "completed" || w.paymentStatus === "paid" || w.paymentStatus === "free";
        return isConfirmedStatus && isCapturedPayment && w.isAuthorized === true;
      });
      let targetEnrollment = null;
      if (requestedTarget) {
        const matchingAnyEnrollment = studentWorkshops.find(
          (w) => w.enrollmentId === requestedTarget || w._id?.toString() === requestedTarget || w.workshop?._id?.toString() === requestedTarget || w.workshop?.batchCode === requestedTarget
        );
        targetEnrollment = verifiedEnrollments.find(
          (w) => w.enrollmentId === requestedTarget || w._id?.toString() === requestedTarget || w.workshop?._id?.toString() === requestedTarget || w.workshop?.batchCode === requestedTarget
        );
        if (!targetEnrollment) {
          if (matchingAnyEnrollment) {
            throw import_apiError.ApiError.forbidden(
              `Access denied: Your enrollment (${matchingAnyEnrollment.enrollmentId}) has status '${matchingAnyEnrollment.status}' and payment status '${matchingAnyEnrollment.paymentStatus}'. Verified captured payment is required to unlock protected workshop content.`
            );
          }
          throw import_apiError.ApiError.forbidden(
            `Access denied: You do not have a confirmed paid enrollment for workshop '${requestedTarget}'. Enrolling in one workshop does not unlock another workshop.`
          );
        }
      } else {
        if (verifiedEnrollments.length === 0) {
          const pendingEnr = studentWorkshops[0];
          if (pendingEnr) {
            throw import_apiError.ApiError.forbidden(
              `Access denied: Payment verification pending (current status: ${pendingEnr.paymentStatus}). Complete Razorpay payment to unlock workshop access.`
            );
          }
          throw import_apiError.ApiError.forbidden(
            "Access denied: Confirmed workshop enrollment and verified payment are required."
          );
        }
        targetEnrollment = verifiedEnrollments[0];
      }
      const enrolledBatchCode = targetEnrollment.workshop?.batchCode;
      const enrolledWorkshopId = targetEnrollment.workshop?._id?.toString();
      const requestedResourceId = req.params?.resourceId || req.query?.resourceId;
      if (requestedResourceId) {
        let resource = null;
        if ((0, import_db.isDBConnected)()) {
          try {
            resource = await import_LearningResource.LearningResource.findById(requestedResourceId);
          } catch {
          }
        }
        if (!resource) {
          const allMemRes = await import_memoryStore.memoryStore.getAllResources();
          resource = allMemRes.find((r) => r._id?.toString() === requestedResourceId);
        }
        if (!resource) {
          throw import_apiError.ApiError.notFound("Requested learning resource was not found.");
        }
        const resBatch = resource.workshopBatchCode;
        const resWsId = resource.workshopId?.toString();
        if (resBatch && resBatch !== "ALL" && resBatch !== enrolledBatchCode && (!resWsId || resWsId !== enrolledWorkshopId)) {
          throw import_apiError.ApiError.forbidden(
            `Access denied: This resource belongs to cohort '${resBatch}', which you are not enrolled in.`
          );
        }
        if (resource.isPublished === false) {
          throw import_apiError.ApiError.forbidden("Access denied: This resource is not yet published.");
        }
        if (resource.releaseAt && new Date(resource.releaseAt) > /* @__PURE__ */ new Date()) {
          throw import_apiError.ApiError.forbidden(
            `Access denied: This resource is scheduled for release on ${new Date(
              resource.releaseAt
            ).toLocaleDateString()}.`
          );
        }
      }
      if (options.requireCompletion || options.resourceType === "certificate") {
        const [certs, subs] = await Promise.all([
          import_memoryStore.memoryStore.getAllCertificates(),
          import_memoryStore.memoryStore.getAllSubmissions()
        ]);
        const hasIssuedCert = certs.some(
          (c) => !c.isRevoked && (c.userId === userId || c.enrollmentId === targetEnrollment.enrollmentId)
        );
        const hasSubmission = subs.some(
          (s) => s.userId === userId && (s.enrollmentId === targetEnrollment.enrollmentId || s.workshopId === enrolledWorkshopId || s.batchCode === enrolledBatchCode)
        );
        const isCompleted = Boolean(targetEnrollment.day1Attended && targetEnrollment.day2Attended) || targetEnrollment.status === "completed" || hasIssuedCert || hasSubmission;
        if (!isCompleted) {
          throw import_apiError.ApiError.forbidden(
            "Certificate locked: Verified completion of Day 1 & Day 2 sessions and capstone project submission are required before certificate issuance."
          );
        }
      }
      req.verifiedEnrollment = targetEnrollment;
      req.verifiedWorkshops = verifiedEnrollments;
      next();
    } catch (error) {
      next(error);
    }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  requireVerifiedWorkshopAccess
});
