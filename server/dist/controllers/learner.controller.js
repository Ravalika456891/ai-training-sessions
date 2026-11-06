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
var learner_controller_exports = {};
__export(learner_controller_exports, {
  LearnerController: () => LearnerController
});
module.exports = __toCommonJS(learner_controller_exports);
var import_mongoose = __toESM(require("mongoose"));
var import_Enrollment = require("../models/Enrollment.js");
var import_Registration = require("../models/Registration.js");
var import_Workshop = require("../models/Workshop.js");
var import_ProjectSubmission = require("../models/ProjectSubmission.js");
var import_Certificate = require("../models/Certificate.js");
var import_Payment = require("../models/Payment.js");
var import_Attendance = require("../models/Attendance.js");
var import_apiError = require("../utils/apiError.js");
var import_db = require("../config/db.js");
var import_memoryStore = require("../services/memoryStore.js");
class LearnerController {
  /**
   * Helper to gather all enrollments & registrations for the authenticated student
   * across both MongoDB Atlas and the resilient memoryStore.
   */
  static async getStudentWorkshops(userId, userEmail) {
    const normalizedEmail = (userEmail || "").toLowerCase().trim();
    const rawEnrollments = [];
    const seenBatchCodes = /* @__PURE__ */ new Set();
    if ((0, import_db.isDBConnected)()) {
      try {
        if (import_mongoose.default.Types.ObjectId.isValid(userId)) {
          const dbEnrollments = await import_Enrollment.Enrollment.find({ userId }).populate("workshopId").sort({ createdAt: -1 });
          for (const enr of dbEnrollments) {
            const ws = enr.workshopId || {};
            if (ws.batchCode) seenBatchCodes.add(ws.batchCode);
            rawEnrollments.push({
              _id: enr._id.toString(),
              enrollmentId: enr.enrollmentId,
              status: enr.status,
              paymentStatus: enr.paymentStatus,
              workshop: ws
            });
          }
        }
        if (normalizedEmail) {
          const dbRegs = await import_Registration.Registration.find({ email: normalizedEmail }).sort({ createdAt: -1 });
          for (const reg of dbRegs) {
            let ws = null;
            if (import_mongoose.default.Types.ObjectId.isValid(reg.batchId)) {
              ws = await import_Workshop.Workshop.findById(reg.batchId);
            }
            if (!ws) {
              ws = await import_Workshop.Workshop.findOne({
                $or: [{ batchCode: reg.batchId }, { slug: reg.batchId }]
              });
            }
            if (!ws) {
              ws = await import_memoryStore.memoryStore.findWorkshop(reg.batchId);
            }
            const batchCode = ws?.batchCode || reg.batchId;
            if (!seenBatchCodes.has(batchCode)) {
              seenBatchCodes.add(batchCode);
              rawEnrollments.push({
                _id: reg._id.toString(),
                enrollmentId: `REG-${reg._id.toString().slice(-6).toUpperCase()}`,
                status: reg.registrationStatus,
                paymentStatus: reg.paymentStatus,
                workshop: ws || {
                  _id: reg.batchId,
                  title: "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
                  batchCode,
                  startDate: /* @__PURE__ */ new Date("2026-11-14T10:00:00+05:30"),
                  endDate: /* @__PURE__ */ new Date("2026-11-15T15:00:00+05:30"),
                  timings: "10:00 AM \u2013 3:00 PM IST",
                  timezone: "Asia/Kolkata (IST)",
                  price: { basePrice: 1999, currency: "INR", taxPercentage: 18, isFree: false }
                }
              });
            }
          }
        }
      } catch (err) {
        console.warn("[LearnerController DB Lookup Fallback]", err.message);
      }
    }
    const memEnrollments = await import_memoryStore.memoryStore.getEnrollmentsByUserId(userId);
    for (const memEnr of memEnrollments) {
      const ws = await import_memoryStore.memoryStore.findWorkshop(memEnr.workshop);
      const batchCode = ws?.batchCode || memEnr.workshop;
      if (!seenBatchCodes.has(batchCode)) {
        seenBatchCodes.add(batchCode);
        rawEnrollments.push({
          _id: memEnr._id,
          enrollmentId: memEnr.enrollmentId,
          status: memEnr.status,
          paymentStatus: memEnr.paymentStatus === "completed" ? "paid" : memEnr.paymentStatus,
          workshop: ws || {}
        });
      }
    }
    if (normalizedEmail) {
      const memRegs = await import_memoryStore.memoryStore.getAllRegistrations();
      for (const reg of memRegs.filter((r) => r.email.toLowerCase() === normalizedEmail)) {
        const ws = await import_memoryStore.memoryStore.findWorkshop(reg.batchId);
        const batchCode = ws?.batchCode || reg.batchId;
        if (!seenBatchCodes.has(batchCode)) {
          seenBatchCodes.add(batchCode);
          rawEnrollments.push({
            _id: reg._id,
            enrollmentId: reg._id.toUpperCase(),
            status: reg.registrationStatus,
            paymentStatus: reg.paymentStatus,
            workshop: ws || {}
          });
        }
      }
    }
    return rawEnrollments.map((enr) => {
      const workshop = enr.workshop || {};
      const now = /* @__PURE__ */ new Date();
      const start = new Date(workshop.startDate || Date.now());
      const end = new Date(workshop.endDate || Date.now());
      const isPaid = enr.paymentStatus === "paid" || enr.paymentStatus === "completed" || enr.paymentStatus === "waived";
      const isPaidConfirmed = enr.status === "confirmed" && (workshop.price?.isFree ? true : isPaid);
      const isLiveOrUpcoming = now.getTime() >= start.getTime() - 30 * 60 * 1e3 && now.getTime() <= end.getTime();
      return {
        _id: enr._id,
        enrollmentId: enr.enrollmentId,
        status: enr.status,
        paymentStatus: isPaid ? "paid" : enr.paymentStatus,
        isAuthorized: isPaidConfirmed,
        workshop: {
          _id: workshop._id,
          title: workshop.title || "AI Launchpad \u2014 2-Day Hands-On AI Bootcamp",
          batchCode: workshop.batchCode || "AILP-2026",
          startDate: workshop.startDate,
          endDate: workshop.endDate,
          timings: workshop.timings || "10:00 AM \u2013 3:00 PM IST",
          timezone: workshop.timezone || "Asia/Kolkata (IST)",
          instructor: workshop.instructor,
          price: workshop.price || { basePrice: 1999, currency: "INR", taxPercentage: 18, isFree: false }
        },
        sessionAccess: {
          isUnlocked: isPaidConfirmed,
          joinUrl: isPaidConfirmed ? "https://meet.google.com/ailp-live-cohort" : null,
          meetingPasscode: isPaidConfirmed ? "AILP2026" : null,
          platform: "Google Meet / Zoom HD Virtual Classroom",
          canJoinNow: isPaidConfirmed && isLiveOrUpcoming,
          reason: !isPaidConfirmed ? "Complete enrollment payment to unlock your live classroom seat." : null
        },
        resources: [
          {
            id: "res-1",
            title: "Module 1 & 2: Reusable 10-Prompt Enterprise Library",
            type: "PDF & Markdown",
            downloadUrl: isPaidConfirmed ? "#download-prompts" : null,
            isGated: !isPaidConfirmed
          },
          {
            id: "res-2",
            title: "Module 3: Custom Assistant Instructions & Grounding Template",
            type: "Starter Pack",
            downloadUrl: isPaidConfirmed ? "#download-assistant" : null,
            isGated: !isPaidConfirmed
          },
          {
            id: "res-3",
            title: "Module 5: React + Tailwind Prototype Starter Repository",
            type: "GitHub Repo",
            downloadUrl: isPaidConfirmed ? "https://github.com/example/ai-prototype-starter" : null,
            isGated: !isPaidConfirmed
          },
          {
            id: "res-4",
            title: "Module 6: Multi-Step n8n / Make.com Lead Workflow Blueprint",
            type: "JSON Workflow",
            downloadUrl: isPaidConfirmed ? "#download-blueprint" : null,
            isGated: !isPaidConfirmed
          }
        ]
      };
    });
  }
  static async getDashboard(req, res, next) {
    try {
      const userId = req.user._id.toString();
      const userEmail = req.user.email;
      const activeWorkshops = await LearnerController.getStudentWorkshops(userId, userEmail);
      let submissions = [];
      let certificates = [];
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId)) {
        try {
          submissions = await import_ProjectSubmission.ProjectSubmission.find({ userId }).sort({ createdAt: -1 });
          certificates = await import_Certificate.Certificate.find({ userId, isRevoked: false }).sort({ createdAt: -1 });
        } catch (err) {
          console.warn("[LearnerController Dashboard Queries]", err.message);
        }
      }
      res.status(200).json({
        success: true,
        data: {
          user: req.user,
          workshops: activeWorkshops,
          submissions,
          certificates
        }
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Dedicated Backend-Enforced Materials Endpoint
   * Verifies that the signed-in student has a confirmed & paid enrollment before returning download URLs.
   */
  static async getAuthorizedMaterials(req, res, next) {
    try {
      const userId = req.user._id.toString();
      const userEmail = req.user.email;
      const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);
      const authorizedWorkshops = workshops.filter((w) => w.isAuthorized);
      if (authorizedWorkshops.length === 0) {
        throw import_apiError.ApiError.forbidden(
          "Access denied: Confirmed enrollment and completed payment are required to access paid learning materials."
        );
      }
      res.status(200).json({
        success: true,
        data: authorizedWorkshops.flatMap((w) => w.resources)
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Dedicated Backend-Enforced Live Classes Endpoint
   * Verifies that the signed-in student has a confirmed & paid enrollment before returning live meeting credentials.
   */
  static async getAuthorizedLiveClasses(req, res, next) {
    try {
      const userId = req.user._id.toString();
      const userEmail = req.user.email;
      const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);
      const authorizedWorkshops = workshops.filter((w) => w.isAuthorized);
      if (authorizedWorkshops.length === 0) {
        throw import_apiError.ApiError.forbidden(
          "Access denied: Confirmed enrollment and completed payment are required to access live class credentials."
        );
      }
      res.status(200).json({
        success: true,
        data: authorizedWorkshops.map((w) => ({
          enrollmentId: w.enrollmentId,
          workshop: w.workshop,
          sessionAccess: w.sessionAccess
        }))
      });
    } catch (error) {
      next(error);
    }
  }
  static async submitProject(req, res, next) {
    try {
      const userId = req.user._id.toString();
      const userEmail = req.user.email;
      const { enrollmentId, projectTitle, repositoryUrl, liveDemoUrl, notes } = req.body;
      if (!projectTitle || !projectTitle.trim()) {
        throw import_apiError.ApiError.badRequest("Project title is required.");
      }
      const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);
      const targetEnrollment = workshops.find(
        (w) => w.enrollmentId === enrollmentId || w._id === enrollmentId
      );
      if (!targetEnrollment) {
        throw import_apiError.ApiError.notFound("Enrollment not found for this student.");
      }
      if (!targetEnrollment.isAuthorized) {
        throw import_apiError.ApiError.forbidden(
          "Only students with confirmed enrollment and completed payment can submit capstone projects."
        );
      }
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId) && import_mongoose.default.Types.ObjectId.isValid(targetEnrollment._id)) {
        const submission = await import_ProjectSubmission.ProjectSubmission.create({
          enrollmentId: targetEnrollment._id,
          userId,
          workshopId: targetEnrollment.workshop._id,
          projectTitle: projectTitle.trim(),
          repositoryUrl,
          liveDemoUrl,
          notes,
          status: "submitted"
        });
        res.status(201).json({
          success: true,
          message: "Capstone project submitted successfully. It is now queued for mentor review.",
          data: submission
        });
        return;
      }
      res.status(201).json({
        success: true,
        message: "Capstone project submitted successfully. It is now queued for mentor review.",
        data: {
          _id: "sub_" + Date.now(),
          enrollmentId: targetEnrollment.enrollmentId,
          userId,
          projectTitle: projectTitle.trim(),
          repositoryUrl,
          liveDemoUrl,
          notes,
          status: "submitted",
          createdAt: /* @__PURE__ */ new Date()
        }
      });
    } catch (error) {
      next(error);
    }
  }
  static async getMySubmissions(req, res, next) {
    try {
      const userId = req.user._id.toString();
      let submissions = [];
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId)) {
        submissions = await import_ProjectSubmission.ProjectSubmission.find({ userId }).populate("workshopId", "title batchCode").sort({ createdAt: -1 });
      }
      res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions
      });
    } catch (error) {
      next(error);
    }
  }
  static async getMyCertificates(req, res, next) {
    try {
      const userId = req.user._id.toString();
      let certificates = [];
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId)) {
        certificates = await import_Certificate.Certificate.find({
          userId,
          isRevoked: false
        }).sort({ createdAt: -1 });
      }
      res.status(200).json({
        success: true,
        count: certificates.length,
        data: certificates
      });
    } catch (error) {
      next(error);
    }
  }
  static async getPayments(req, res, next) {
    try {
      const userId = req.user._id.toString();
      let payments = [];
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId)) {
        payments = await import_Payment.Payment.find({ userId }).populate("workshopId", "title batchCode startDate price").sort({ createdAt: -1 });
      }
      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments
      });
    } catch (error) {
      next(error);
    }
  }
  static async getProgress(req, res, next) {
    try {
      const userId = req.user._id.toString();
      const userEmail = req.user.email;
      const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);
      let submissions = [];
      let attendance = [];
      let certificates = [];
      if ((0, import_db.isDBConnected)() && import_mongoose.default.Types.ObjectId.isValid(userId)) {
        try {
          submissions = await import_ProjectSubmission.ProjectSubmission.find({ userId });
          attendance = await import_Attendance.Attendance.find({ userId });
          certificates = await import_Certificate.Certificate.find({ userId, isRevoked: false });
        } catch {
        }
      }
      const progress = workshops.map((enr) => {
        const hasDay1 = attendance.some(
          (a) => a.enrollmentId?.toString() === enr._id?.toString() && a.dayNumber === 1 && a.status === "present"
        );
        const hasDay2 = attendance.some(
          (a) => a.enrollmentId?.toString() === enr._id?.toString() && a.dayNumber === 2 && a.status === "present"
        );
        const hasSubmitted = submissions.some(
          (s) => s.enrollmentId?.toString() === enr._id?.toString()
        );
        const hasCert = certificates.some(
          (c) => c.enrollmentId?.toString() === enr._id?.toString()
        );
        let score = enr.isAuthorized ? 20 : 10;
        if (hasDay1) score += 20;
        if (hasDay2) score += 20;
        if (hasSubmitted) score += 20;
        if (hasCert) score += 20;
        return {
          enrollmentId: enr.enrollmentId,
          workshopTitle: enr.workshop?.title || "AI Launchpad Bootcamp",
          batchCode: enr.workshop?.batchCode || "AILP-COHORT",
          percentage: Math.min(score, 100),
          day1Attended: hasDay1,
          day2Attended: hasDay2,
          projectSubmitted: hasSubmitted,
          certificateEarned: hasCert,
          status: enr.status,
          paymentStatus: enr.paymentStatus
        };
      });
      res.status(200).json({
        success: true,
        data: progress
      });
    } catch (error) {
      next(error);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LearnerController
});
//# sourceMappingURL=learner.controller.js.map
