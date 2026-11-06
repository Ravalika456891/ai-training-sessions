import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Enrollment } from '../models/Enrollment.js';
import { Registration } from '../models/Registration.js';
import { Workshop } from '../models/Workshop.js';
import { ProjectSubmission } from '../models/ProjectSubmission.js';
import { Certificate } from '../models/Certificate.js';
import { Payment } from '../models/Payment.js';
import { Attendance } from '../models/Attendance.js';
import { ApiError } from '../utils/apiError.js';
import { isDBConnected } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

export class LearnerController {
  /**
   * Helper to gather all enrollments & registrations for the authenticated student
   * across both MongoDB Atlas and the resilient memoryStore.
   */
  private static async getStudentWorkshops(userId: string, userEmail: string): Promise<any[]> {
    const normalizedEmail = (userEmail || '').toLowerCase().trim();
    const rawEnrollments: any[] = [];
    const seenBatchCodes = new Set<string>();

    // 1. Query MongoDB Enrollments & Registrations if connected
    if (isDBConnected()) {
      try {
        if (mongoose.Types.ObjectId.isValid(userId)) {
          const dbEnrollments = await Enrollment.find({ userId })
            .populate('workshopId')
            .sort({ createdAt: -1 });
          for (const enr of dbEnrollments) {
            const ws: any = enr.workshopId || {};
            if (ws.batchCode) seenBatchCodes.add(ws.batchCode);
            rawEnrollments.push({
              _id: enr._id.toString(),
              enrollmentId: enr.enrollmentId,
              status: enr.status,
              paymentStatus: enr.paymentStatus,
              workshop: ws,
            });
          }
        }

        if (normalizedEmail) {
          const dbRegs = await Registration.find({ email: normalizedEmail }).sort({ createdAt: -1 });
          for (const reg of dbRegs) {
            let ws: any = null;
            if (mongoose.Types.ObjectId.isValid(reg.batchId)) {
              ws = await Workshop.findById(reg.batchId);
            }
            if (!ws) {
              ws = await Workshop.findOne({
                $or: [{ batchCode: reg.batchId }, { slug: reg.batchId }],
              });
            }
            if (!ws) {
              ws = await memoryStore.findWorkshop(reg.batchId);
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
                  title: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
                  batchCode,
                  startDate: new Date('2026-11-14T10:00:00+05:30'),
                  endDate: new Date('2026-11-15T15:00:00+05:30'),
                  timings: '10:00 AM – 3:00 PM IST',
                  timezone: 'Asia/Kolkata (IST)',
                  price: { basePrice: 1999, currency: 'INR', taxPercentage: 18, isFree: false },
                },
              });
            }
          }
        }
      } catch (err: any) {
        console.warn('[LearnerController DB Lookup Fallback]', err.message);
      }
    }

    // 2. Check MemoryStore Enrollments & Registrations
    const memEnrollments = await memoryStore.getEnrollmentsByUserId(userId);
    for (const memEnr of memEnrollments) {
      const ws = await memoryStore.findWorkshop(memEnr.workshop);
      const batchCode = ws?.batchCode || memEnr.workshop;
      if (!seenBatchCodes.has(batchCode)) {
        seenBatchCodes.add(batchCode);
        rawEnrollments.push({
          _id: memEnr._id,
          enrollmentId: memEnr.enrollmentId,
          status: memEnr.status,
          paymentStatus: memEnr.paymentStatus === 'completed' ? 'paid' : memEnr.paymentStatus,
          workshop: ws || {},
        });
      }
    }

    if (normalizedEmail) {
      const memRegs = await memoryStore.getAllRegistrations();
      for (const reg of memRegs.filter((r) => r.email.toLowerCase() === normalizedEmail)) {
        const ws = await memoryStore.findWorkshop(reg.batchId);
        const batchCode = ws?.batchCode || reg.batchId;
        if (!seenBatchCodes.has(batchCode)) {
          seenBatchCodes.add(batchCode);
          rawEnrollments.push({
            _id: reg._id,
            enrollmentId: reg._id.toUpperCase(),
            status: reg.registrationStatus,
            paymentStatus: reg.paymentStatus,
            workshop: ws || {},
          });
        }
      }
    }

    // 3. Map with strict enrollment & payment authorization
    return rawEnrollments.map((enr: any) => {
      const workshop = enr.workshop || {};
      const now = new Date();
      const start = new Date(workshop.startDate || Date.now());
      const end = new Date(workshop.endDate || Date.now());

      const isPaid =
        enr.paymentStatus === 'paid' ||
        enr.paymentStatus === 'completed' ||
        enr.paymentStatus === 'waived';

      // Strict enrollment authorization:
      // Paid workshops require confirmed status AND verified payment.
      // Free workshops require confirmed status.
      const isPaidConfirmed =
        enr.status === 'confirmed' && (workshop.price?.isFree ? true : isPaid);

      const isLiveOrUpcoming =
        now.getTime() >= start.getTime() - 30 * 60 * 1000 &&
        now.getTime() <= end.getTime();

      return {
        _id: enr._id,
        enrollmentId: enr.enrollmentId,
        status: enr.status,
        paymentStatus: isPaid ? 'paid' : enr.paymentStatus,
        isAuthorized: isPaidConfirmed,
        workshop: {
          _id: workshop._id,
          title: workshop.title || 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
          batchCode: workshop.batchCode || 'AILP-2026',
          startDate: workshop.startDate,
          endDate: workshop.endDate,
          timings: workshop.timings || '10:00 AM – 3:00 PM IST',
          timezone: workshop.timezone || 'Asia/Kolkata (IST)',
          instructor: workshop.instructor,
          price: workshop.price || { basePrice: 1999, currency: 'INR', taxPercentage: 18, isFree: false },
        },
        sessionAccess: {
          isUnlocked: isPaidConfirmed,
          joinUrl: isPaidConfirmed ? 'https://meet.google.com/ailp-live-cohort' : null,
          meetingPasscode: isPaidConfirmed ? 'AILP2026' : null,
          platform: 'Google Meet / Zoom HD Virtual Classroom',
          canJoinNow: isPaidConfirmed && isLiveOrUpcoming,
          reason: !isPaidConfirmed
            ? 'Complete enrollment payment to unlock your live classroom seat.'
            : null,
        },
        resources: [
          {
            id: 'res-1',
            title: 'Module 1 & 2: Reusable 10-Prompt Enterprise Library',
            type: 'PDF & Markdown',
            downloadUrl: isPaidConfirmed ? '#download-prompts' : null,
            isGated: !isPaidConfirmed,
          },
          {
            id: 'res-2',
            title: 'Module 3: Custom Assistant Instructions & Grounding Template',
            type: 'Starter Pack',
            downloadUrl: isPaidConfirmed ? '#download-assistant' : null,
            isGated: !isPaidConfirmed,
          },
          {
            id: 'res-3',
            title: 'Module 5: React + Tailwind Prototype Starter Repository',
            type: 'GitHub Repo',
            downloadUrl: isPaidConfirmed ? 'https://github.com/example/ai-prototype-starter' : null,
            isGated: !isPaidConfirmed,
          },
          {
            id: 'res-4',
            title: 'Module 6: Multi-Step n8n / Make.com Lead Workflow Blueprint',
            type: 'JSON Workflow',
            downloadUrl: isPaidConfirmed ? '#download-blueprint' : null,
            isGated: !isPaidConfirmed,
          },
        ],
      };
    });
  }

  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;

      const activeWorkshops = await LearnerController.getStudentWorkshops(userId, userEmail);

      let submissions: any[] = [];
      let certificates: any[] = [];

      if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
        try {
          submissions = await ProjectSubmission.find({ userId }).sort({ createdAt: -1 });
          certificates = await Certificate.find({ userId, isRevoked: false }).sort({ createdAt: -1 });
        } catch (err: any) {
          console.warn('[LearnerController Dashboard Queries]', err.message);
        }
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
          workshops: activeWorkshops,
          submissions,
          certificates,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dedicated Backend-Enforced Materials Endpoint
   * Verifies that the signed-in student has a confirmed & paid enrollment before returning download URLs.
   */
  static async getAuthorizedMaterials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;
      const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);

      const authorizedWorkshops = workshops.filter((w) => w.isAuthorized);
      if (authorizedWorkshops.length === 0) {
        throw ApiError.forbidden(
          'Access denied: Confirmed enrollment and completed payment are required to access paid learning materials.'
        );
      }

      res.status(200).json({
        success: true,
        data: authorizedWorkshops.flatMap((w) => w.resources),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dedicated Backend-Enforced Live Classes Endpoint
   * Verifies that the signed-in student has a confirmed & paid enrollment before returning live meeting credentials.
   */
  static async getAuthorizedLiveClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;
      const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);

      const authorizedWorkshops = workshops.filter((w) => w.isAuthorized);
      if (authorizedWorkshops.length === 0) {
        throw ApiError.forbidden(
          'Access denied: Confirmed enrollment and completed payment are required to access live class credentials.'
        );
      }

      res.status(200).json({
        success: true,
        data: authorizedWorkshops.map((w) => ({
          enrollmentId: w.enrollmentId,
          workshop: w.workshop,
          sessionAccess: w.sessionAccess,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;
      const { enrollmentId, projectTitle, repositoryUrl, liveDemoUrl, notes } = req.body;

      if (!projectTitle || !projectTitle.trim()) {
        throw ApiError.badRequest('Project title is required.');
      }

      const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);
      const targetEnrollment = workshops.find(
        (w) => w.enrollmentId === enrollmentId || w._id === enrollmentId
      );

      if (!targetEnrollment) {
        throw ApiError.notFound('Enrollment not found for this student.');
      }

      if (!targetEnrollment.isAuthorized) {
        throw ApiError.forbidden(
          'Only students with confirmed enrollment and completed payment can submit capstone projects.'
        );
      }

      if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId) && mongoose.Types.ObjectId.isValid(targetEnrollment._id)) {
        const submission = await ProjectSubmission.create({
          enrollmentId: targetEnrollment._id,
          userId,
          workshopId: targetEnrollment.workshop._id,
          projectTitle: projectTitle.trim(),
          repositoryUrl,
          liveDemoUrl,
          notes,
          status: 'submitted',
        });

        res.status(201).json({
          success: true,
          message: 'Capstone project submitted successfully. It is now queued for mentor review.',
          data: submission,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Capstone project submitted successfully. It is now queued for mentor review.',
        data: {
          _id: 'sub_' + Date.now(),
          enrollmentId: targetEnrollment.enrollmentId,
          userId,
          projectTitle: projectTitle.trim(),
          repositoryUrl,
          liveDemoUrl,
          notes,
          status: 'submitted',
          createdAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMySubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      let submissions: any[] = [];

      if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
        submissions = await ProjectSubmission.find({ userId })
          .populate('workshopId', 'title batchCode')
          .sort({ createdAt: -1 });
      }

      res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      let certificates: any[] = [];

      if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
        certificates = await Certificate.find({
          userId,
          isRevoked: false,
        }).sort({ createdAt: -1 });
      }

      res.status(200).json({
        success: true,
        count: certificates.length,
        data: certificates,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      let payments: any[] = [];

      if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
        payments = await Payment.find({ userId })
          .populate('workshopId', 'title batchCode startDate price')
          .sort({ createdAt: -1 });
      }

      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;
      const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);

      let submissions: any[] = [];
      let attendance: any[] = [];
      let certificates: any[] = [];

      if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
        try {
          submissions = await ProjectSubmission.find({ userId });
          attendance = await Attendance.find({ userId });
          certificates = await Certificate.find({ userId, isRevoked: false });
        } catch {
          // ignore fallback
        }
      }

      const progress = workshops.map((enr: any) => {
        const hasDay1 = attendance.some(
          (a: any) =>
            a.enrollmentId?.toString() === enr._id?.toString() &&
            a.dayNumber === 1 &&
            a.status === 'present'
        );
        const hasDay2 = attendance.some(
          (a: any) =>
            a.enrollmentId?.toString() === enr._id?.toString() &&
            a.dayNumber === 2 &&
            a.status === 'present'
        );
        const hasSubmitted = submissions.some(
          (s: any) => s.enrollmentId?.toString() === enr._id?.toString()
        );
        const hasCert = certificates.some(
          (c: any) => c.enrollmentId?.toString() === enr._id?.toString()
        );

        let score = enr.isAuthorized ? 20 : 10;
        if (hasDay1) score += 20;
        if (hasDay2) score += 20;
        if (hasSubmitted) score += 20;
        if (hasCert) score += 20;

        return {
          enrollmentId: enr.enrollmentId,
          workshopTitle: enr.workshop?.title || 'AI Launchpad Bootcamp',
          batchCode: enr.workshop?.batchCode || 'AILP-COHORT',
          percentage: Math.min(score, 100),
          day1Attended: hasDay1,
          day2Attended: hasDay2,
          projectSubmitted: hasSubmitted,
          certificateEarned: hasCert,
          status: enr.status,
          paymentStatus: enr.paymentStatus,
        };
      });

      res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }
}
