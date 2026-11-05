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
var learner_controller_exports = {};
__export(learner_controller_exports, {
  LearnerController: () => LearnerController
});
module.exports = __toCommonJS(learner_controller_exports);
var import_Enrollment = require("../models/Enrollment.js");
var import_ProjectSubmission = require("../models/ProjectSubmission.js");
var import_Certificate = require("../models/Certificate.js");
var import_Payment = require("../models/Payment.js");
var import_Attendance = require("../models/Attendance.js");
var import_apiError = require("../utils/apiError.js");
class LearnerController {
  static async getDashboard(req, res, next) {
    try {
      const userId = req.user._id;
      const enrollments = await import_Enrollment.Enrollment.find({ userId }).populate("workshopId").sort({ createdAt: -1 });
      const submissions = await import_ProjectSubmission.ProjectSubmission.find({ userId });
      const certificates = await import_Certificate.Certificate.find({ userId, isRevoked: false });
      const activeWorkshops = enrollments.map((enr) => {
        const workshop = enr.workshopId || {};
        const now = /* @__PURE__ */ new Date();
        const start = new Date(workshop.startDate || Date.now());
        const end = new Date(workshop.endDate || Date.now());
        const isPaidConfirmed = enr.status === "confirmed" && (workshop.price?.isFree ? true : enr.paymentStatus === "paid");
        const isLiveOrUpcoming = now.getTime() >= start.getTime() - 30 * 60 * 1e3 && now.getTime() <= end.getTime();
        return {
          enrollmentId: enr.enrollmentId,
          status: enr.status,
          paymentStatus: enr.paymentStatus,
          isAuthorized: isPaidConfirmed,
          workshop: {
            _id: workshop._id,
            title: workshop.title,
            batchCode: workshop.batchCode,
            startDate: workshop.startDate,
            endDate: workshop.endDate,
            timings: workshop.timings,
            timezone: workshop.timezone,
            instructor: workshop.instructor,
            price: workshop.price
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
  static async submitProject(req, res, next) {
    try {
      const userId = req.user._id;
      const { enrollmentId, projectTitle, repositoryUrl, liveDemoUrl, notes } = req.body;
      const enrollment = await import_Enrollment.Enrollment.findOne({
        $or: [{ enrollmentId }, { _id: enrollmentId }],
        userId
      });
      if (!enrollment) {
        throw import_apiError.ApiError.notFound("Enrollment not found for this participant.");
      }
      if (enrollment.status !== "confirmed") {
        throw import_apiError.ApiError.badRequest("Only confirmed participants can submit capstone projects.");
      }
      const submission = await import_ProjectSubmission.ProjectSubmission.create({
        enrollmentId: enrollment._id,
        userId,
        workshopId: enrollment.workshopId,
        projectTitle,
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
    } catch (error) {
      next(error);
    }
  }
  static async getMySubmissions(req, res, next) {
    try {
      const submissions = await import_ProjectSubmission.ProjectSubmission.find({ userId: req.user._id }).populate("workshopId", "title batchCode").sort({ createdAt: -1 });
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
      const certificates = await import_Certificate.Certificate.find({
        userId: req.user._id,
        isRevoked: false
      }).sort({ createdAt: -1 });
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
      const userId = req.user._id;
      const payments = await import_Payment.Payment.find({ userId }).populate("workshopId", "title batchCode startDate price").sort({ createdAt: -1 });
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
      const userId = req.user._id;
      const enrollments = await import_Enrollment.Enrollment.find({ userId }).populate("workshopId");
      const submissions = await import_ProjectSubmission.ProjectSubmission.find({ userId });
      const attendance = await import_Attendance.Attendance.find({ userId });
      const certificates = await import_Certificate.Certificate.find({ userId, isRevoked: false });
      const progress = enrollments.map((enr) => {
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
        let score = 0;
        if (hasDay1) score += 25;
        if (hasDay2) score += 25;
        if (hasSubmitted) score += 25;
        if (hasCert) score += 25;
        return {
          enrollmentId: enr.enrollmentId,
          workshopTitle: enr.workshopId?.title || "AI Launchpad Bootcamp",
          batchCode: enr.workshopId?.batchCode || "AILP-COHORT",
          percentage: score,
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
