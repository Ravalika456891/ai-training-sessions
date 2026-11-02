import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { Enrollment } from '../models/Enrollment.js';
import { Workshop } from '../models/Workshop.js';
import { Payment } from '../models/Payment.js';
import { Attendance } from '../models/Attendance.js';
import { Certificate } from '../models/Certificate.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

export class AdminController {
  // Aggregate Metrics Overview
  static async getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalEnrollments = await Enrollment.countDocuments();
      const confirmedEnrollments = await Enrollment.countDocuments({ status: 'confirmed' });
      const pendingEnrollments = await Enrollment.countDocuments({ status: 'pending' });

      const payments = await Payment.find({ status: 'captured' });
      const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

      const workshops = await Workshop.find({ status: 'published' });
      const totalCapacity = workshops.reduce((acc, w) => acc + w.capacity, 0);
      const totalEnrolled = workshops.reduce((acc, w) => acc + w.enrolledCount, 0);
      const capacityFillRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

      const totalCertificates = await Certificate.countDocuments({ isRevoked: false });

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
          activeCohortsCount: workshops.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Workshop Attendees Roster
  static async getRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workshopId } = req.params;

      const enrollments = await Enrollment.find({ workshopId })
        .populate('userId', 'name email phone role userCategory')
        .sort({ createdAt: -1 });

      const attendanceRecords = await Attendance.find({ workshopId });

      const attendees = enrollments.map((enr: any) => {
        const day1 = attendanceRecords.some(
          (a) => a.enrollmentId.toString() === enr._id.toString() && a.dayNumber === 1 && a.status === 'present'
        );
        const day2 = attendanceRecords.some(
          (a) => a.enrollmentId.toString() === enr._id.toString() && a.dayNumber === 2 && a.status === 'present'
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
          enrolledAt: enr.enrolledAt,
        };
      });

      res.status(200).json({
        success: true,
        count: attendees.length,
        data: attendees,
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark Attendance for Day 1 or Day 2
  static async markAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { enrollmentId, dayNumber, status } = req.body;

      const enrollment = await Enrollment.findOne({
        $or: [{ enrollmentId }, { _id: enrollmentId }],
      });

      if (!enrollment) {
        throw ApiError.notFound('Enrollment not found.');
      }

      const attendance = await Attendance.findOneAndUpdate(
        { enrollmentId: enrollment._id, dayNumber: Number(dayNumber) },
        {
          enrollmentId: enrollment._id,
          workshopId: enrollment.workshopId,
          userId: enrollment.userId,
          dayNumber: Number(dayNumber),
          status: status || 'present',
          markedBy: req.user!._id,
          markedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      res.status(200).json({
        success: true,
        message: `Attendance marked for Day ${dayNumber}.`,
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }

  // Issue Official Verifiable Certificate
  static async issueCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { enrollmentId } = req.body;

      const enrollment = await Enrollment.findOne({
        $or: [{ enrollmentId }, { _id: enrollmentId }],
      }).populate('workshopId userId');

      if (!enrollment) {
        throw ApiError.notFound('Enrollment not found.');
      }

      if (enrollment.status !== 'confirmed') {
        throw ApiError.badRequest('Certificates can only be issued to confirmed participants.');
      }

      const existingCert = await Certificate.findOne({ enrollmentId: enrollment._id });
      if (existingCert) {
        res.status(200).json({
          success: true,
          message: 'Certificate already issued for this enrollment.',
          data: existingCert,
        });
        return;
      }

      const workshop = enrollment.workshopId as any;
      const serialSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const serialNumber = `AILP-CERT-2026-${serialSuffix}`;

      // Cryptographic verification hash
      const verificationHash = crypto
        .createHmac('sha256', env.JWT_SECRET)
        .update(`${serialNumber}|${enrollment.attendeeDetails.fullName}|${workshop.title}`)
        .digest('hex');

      const certificate = await Certificate.create({
        serialNumber,
        enrollmentId: enrollment._id,
        userId: enrollment.userId,
        workshopId: workshop._id,
        recipientName: enrollment.attendeeDetails.fullName,
        workshopTitle: workshop.title,
        completionDate: new Date(),
        verificationHash,
        issuedAt: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Certificate issued successfully.',
        data: certificate,
      });
    } catch (error) {
      next(error);
    }
  }
}

