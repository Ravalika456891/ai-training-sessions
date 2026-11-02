import { Request, Response, NextFunction } from 'express';
import { Enrollment } from '../models/Enrollment.js';
import { ProjectSubmission } from '../models/ProjectSubmission.js';
import { Certificate } from '../models/Certificate.js';
import { ApiError } from '../utils/apiError.js';

export class LearnerController {
  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id;

      // 1. Get confirmed/pending enrollments
      const enrollments = await Enrollment.find({ userId })
        .populate('workshopId')
        .sort({ createdAt: -1 });

      // 2. Get learner's project submissions
      const submissions = await ProjectSubmission.find({ userId });

      // 3. Get learner's certificates
      const certificates = await Certificate.find({ userId, isRevoked: false });

      // 4. Build curated workshop session materials and join credentials
      const activeWorkshops = enrollments.map((enr: any) => {
        const workshop = enr.workshopId;
        const now = new Date();
        const start = new Date(workshop.startDate);
        const end = new Date(workshop.endDate);

        // Time-gated access check: Join link unlocks 30 mins before session or during live weekend
        const isLiveOrUpcoming = now.getTime() >= start.getTime() - 30 * 60 * 1000 && now.getTime() <= end.getTime();

        return {
          enrollmentId: enr.enrollmentId,
          status: enr.status,
          paymentStatus: enr.paymentStatus,
          workshop: {
            _id: workshop._id,
            title: workshop.title,
            batchCode: workshop.batchCode,
            startDate: workshop.startDate,
            endDate: workshop.endDate,
            timings: workshop.timings,
            timezone: workshop.timezone,
            instructor: workshop.instructor,
          },
          sessionAccess: {
            isUnlocked: enr.status === 'confirmed',
            joinUrl: enr.status === 'confirmed' ? 'https://meet.google.com/ailp-live-cohort' : null,
            meetingPasscode: enr.status === 'confirmed' ? 'AILP2026' : null,
            platform: 'Google Meet / Zoom HD Virtual Classroom',
            canJoinNow: isLiveOrUpcoming,
          },
          resources: [
            {
              id: 'res-1',
              title: 'Module 1 & 2: Reusable 10-Prompt Enterprise Library',
              type: 'PDF & Markdown',
              downloadUrl: '#download-prompts',
            },
            {
              id: 'res-2',
              title: 'Module 3: Custom Assistant Instructions & Grounding Template',
              type: 'Starter Pack',
              downloadUrl: '#download-assistant',
            },
            {
              id: 'res-3',
              title: 'Module 5: React + Tailwind Prototype Starter Repository',
              type: 'GitHub Repo',
              downloadUrl: 'https://github.com/example/ai-prototype-starter',
            },
            {
              id: 'res-4',
              title: 'Module 6: Multi-Step n8n / Make.com Lead Workflow Blueprint',
              type: 'JSON Workflow',
              downloadUrl: '#download-blueprint',
            },
          ],
        };
      });

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

  static async submitProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id;
      const { enrollmentId, projectTitle, repositoryUrl, liveDemoUrl, notes } = req.body;

      const enrollment = await Enrollment.findOne({
        $or: [{ enrollmentId }, { _id: enrollmentId }],
        userId,
      });

      if (!enrollment) {
        throw ApiError.notFound('Enrollment not found for this participant.');
      }

      if (enrollment.status !== 'confirmed') {
        throw ApiError.badRequest('Only confirmed participants can submit capstone projects.');
      }

      const submission = await ProjectSubmission.create({
        enrollmentId: enrollment._id,
        userId,
        workshopId: enrollment.workshopId,
        projectTitle,
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
    } catch (error) {
      next(error);
    }
  }

  static async getMySubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submissions = await ProjectSubmission.find({ userId: req.user!._id })
        .populate('workshopId', 'title batchCode')
        .sort({ createdAt: -1 });

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
      const certificates = await Certificate.find({
        userId: req.user!._id,
        isRevoked: false,
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: certificates.length,
        data: certificates,
      });
    } catch (error) {
      next(error);
    }
  }
}

