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
var admin_controller_exports = {};
__export(admin_controller_exports, {
  AdminController: () => AdminController
});
module.exports = __toCommonJS(admin_controller_exports);
var import_crypto = __toESM(require("crypto"));
var import_Enrollment = require("../models/Enrollment.js");
var import_Workshop = require("../models/Workshop.js");
var import_Payment = require("../models/Payment.js");
var import_Attendance = require("../models/Attendance.js");
var import_Certificate = require("../models/Certificate.js");
var import_apiError = require("../utils/apiError.js");
var import_env = require("../config/env.js");
class AdminController {
  // Aggregate Metrics Overview
  static async getMetrics(_req, res, next) {
    try {
      const totalEnrollments = await import_Enrollment.Enrollment.countDocuments();
      const confirmedEnrollments = await import_Enrollment.Enrollment.countDocuments({ status: "confirmed" });
      const pendingEnrollments = await import_Enrollment.Enrollment.countDocuments({ status: "pending" });
      const payments = await import_Payment.Payment.find({ status: "captured" });
      const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
      const workshops = await import_Workshop.Workshop.find({ status: "published" });
      const totalCapacity = workshops.reduce((acc, w) => acc + w.capacity, 0);
      const totalEnrolled = workshops.reduce((acc, w) => acc + w.enrolledCount, 0);
      const capacityFillRate = totalCapacity > 0 ? Math.round(totalEnrolled / totalCapacity * 100) : 0;
      const totalCertificates = await import_Certificate.Certificate.countDocuments({ isRevoked: false });
      res.status(200).json({
        success: true,
        data: {
          totalEnrollments,
          confirmedEnrollments,
          pendingEnrollments,
          totalRevenue,
          totalCapacity,
          totalEnrolled,
          capacityFillRate,
          totalCertificates,
          activeCohortsCount: workshops.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
  // Workshop Attendees Roster
  static async getRoster(req, res, next) {
    try {
      const { workshopId } = req.params;
      const enrollments = await import_Enrollment.Enrollment.find({ workshopId }).populate("userId", "name email phone role userCategory").sort({ createdAt: -1 });
      const attendanceRecords = await import_Attendance.Attendance.find({ workshopId });
      const attendees = enrollments.map((enr) => {
        const day1 = attendanceRecords.some(
          (a) => a.enrollmentId.toString() === enr._id.toString() && a.dayNumber === 1 && a.status === "present"
        );
        const day2 = attendanceRecords.some(
          (a) => a.enrollmentId.toString() === enr._id.toString() && a.dayNumber === 2 && a.status === "present"
        );
        return {
          enrollmentId: enr.enrollmentId,
          learnerName: enr.attendeeDetails?.fullName || enr.userId?.name,
          email: enr.attendeeDetails?.email || enr.userId?.email,
          phone: enr.attendeeDetails?.phone || enr.userId?.phone?.number,
          userCategory: enr.attendeeDetails?.userCategory || enr.userId?.userCategory,
          status: enr.status,
          paymentStatus: enr.paymentStatus,
          day1Attended: day1,
          day2Attended: day2,
          enrolledAt: enr.enrolledAt
        };
      });
      res.status(200).json({
        success: true,
        count: attendees.length,
        data: attendees
      });
    } catch (error) {
      next(error);
    }
  }
  // Mark Attendance for Day 1 or Day 2
  static async markAttendance(req, res, next) {
    try {
      const { enrollmentId, dayNumber, status } = req.body;
      const enrollment = await import_Enrollment.Enrollment.findOne({
        $or: [{ enrollmentId }, { _id: enrollmentId }]
      });
      if (!enrollment) {
        throw import_apiError.ApiError.notFound("Enrollment not found.");
      }
      const attendance = await import_Attendance.Attendance.findOneAndUpdate(
        { enrollmentId: enrollment._id, dayNumber: Number(dayNumber) },
        {
          enrollmentId: enrollment._id,
          workshopId: enrollment.workshopId,
          userId: enrollment.userId,
          dayNumber: Number(dayNumber),
          status: status || "present",
          markedBy: req.user._id,
          markedAt: /* @__PURE__ */ new Date()
        },
        { upsert: true, new: true }
      );
      res.status(200).json({
        success: true,
        message: `Attendance marked for Day ${dayNumber}.`,
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  }
  // Issue Official Verifiable Certificate
  static async issueCertificate(req, res, next) {
    try {
      const { enrollmentId } = req.body;
      const enrollment = await import_Enrollment.Enrollment.findOne({
        $or: [{ enrollmentId }, { _id: enrollmentId }]
      }).populate("workshopId userId");
      if (!enrollment) {
        throw import_apiError.ApiError.notFound("Enrollment not found.");
      }
      if (enrollment.status !== "confirmed") {
        throw import_apiError.ApiError.badRequest("Certificates can only be issued to confirmed participants.");
      }
      const existingCert = await import_Certificate.Certificate.findOne({ enrollmentId: enrollment._id });
      if (existingCert) {
        res.status(200).json({
          success: true,
          message: "Certificate already issued for this enrollment.",
          data: existingCert
        });
        return;
      }
      const workshop = enrollment.workshopId;
      const serialSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const serialNumber = `AILP-CERT-2026-${serialSuffix}`;
      const verificationHash = import_crypto.default.createHmac("sha256", import_env.env.JWT_SECRET).update(`${serialNumber}|${enrollment.attendeeDetails.fullName}|${workshop.title}`).digest("hex");
      const certificate = await import_Certificate.Certificate.create({
        serialNumber,
        enrollmentId: enrollment._id,
        userId: enrollment.userId,
        workshopId: workshop._id,
        recipientName: enrollment.attendeeDetails.fullName,
        workshopTitle: workshop.title,
        completionDate: /* @__PURE__ */ new Date(),
        verificationHash,
        issuedAt: /* @__PURE__ */ new Date()
      });
      res.status(201).json({
        success: true,
        message: "Certificate issued successfully.",
        data: certificate
      });
    } catch (error) {
      next(error);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AdminController
});
//# sourceMappingURL=admin.controller.js.map
