import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Enrollment } from '../models/Enrollment.js';
import { Registration } from '../models/Registration.js';
import { Workshop } from '../models/Workshop.js';
import { WorkshopSession } from '../models/WorkshopSession.js';
import { LearningResource } from '../models/LearningResource.js';
import { Assignment } from '../models/Assignment.js';
import { ProjectSubmission } from '../models/ProjectSubmission.js';
import { Certificate } from '../models/Certificate.js';
import { Attendance } from '../models/Attendance.js';
import { EnrollmentService } from '../services/enrollment.service.js';
import { PaymentService } from '../services/payment.service.js';
import { ApiError } from '../utils/apiError.js';
import { isDBConnected } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

export class LearnerController {
  /**
   * Helper to gather all enrollments & registrations for the authenticated student
   * across both MongoDB Atlas and the resilient memoryStore, enriched with real
   * WorkshopSession and LearningResource records.
   */
  private static async getStudentWorkshops(userId: string, userEmail: string): Promise<any[]> {
    const normalizedEmail = (userEmail || '').toLowerCase().trim();
    const rawEnrollments: any[] = [];
    const seenBatchCodes = new Set<string>();

    // Fetch real sessions & learning resources from MongoDB or memoryStore
    let allSessions: any[] = [];
    let allResources: any[] = [];

    if (isDBConnected()) {
      try {
        [allSessions, allResources] = await Promise.all([
          WorkshopSession.find().sort({ dayNumber: 1 }),
          LearningResource.find({ isPublished: true }).sort({ createdAt: -1 }),
        ]);
      } catch (err: any) {
        console.warn('[LearnerController Sessions/Resources Fallback]', err.message);
      }
    }
    if (allSessions.length === 0) {
      allSessions = await memoryStore.getAllSessions();
    }
    if (allResources.length === 0) {
      allResources = (await memoryStore.getAllResources()).filter(
        (r) => r.isPublished && !['faq', 'testimonial'].includes(r.category)
      );
    }

    // 1. Query MongoDB Enrollments & Registrations if connected
    if (isDBConnected()) {
      try {
        if (mongoose.Types.ObjectId.isValid(userId)) {
          const dbEnrollments = await Enrollment.find({ userId })
            .populate('workshopId')
            .sort({ createdAt: -1 });
          for (const enr of dbEnrollments) {
            if (enr.status === 'cancelled') continue;
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
            if (reg.registrationStatus === 'cancelled') continue;
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
      if (memEnr.status === 'cancelled') continue;
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
        if (reg.registrationStatus === 'cancelled') continue;
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
      const batchCode = workshop.batchCode || 'AILP-2026-NOV-14';
      const now = new Date();
      const start = new Date(workshop.startDate || Date.now());
      const end = new Date(workshop.endDate || Date.now());

      const isCaptured =
        enr.paymentStatus === 'captured' ||
        enr.paymentStatus === 'paid' ||
        enr.paymentStatus === 'completed' ||
        enr.paymentStatus === 'free' ||
        enr.paymentStatus === 'waived';

      const isFreeWorkshop = Boolean(workshop.price?.isFree || workshop.price?.basePrice === 0);

      // Strict enrollment authorization:
      // Paid workshops require confirmed status AND verified captured payment.
      // Never treat 'created', 'authorized', 'pending', or 'failed' as a confirmed paid enrollment.
      const isConfirmedStatus =
        enr.status === 'confirmed' ||
        enr.status === 'completed' ||
        enr.status === 'attended';
      const isPaidConfirmed = isConfirmedStatus && (isFreeWorkshop ? true : isCaptured);

      const isLiveOrUpcoming =
        now.getTime() >= start.getTime() - 30 * 60 * 1000 &&
        now.getTime() <= end.getTime();

      // Match real Day 1 & Day 2 sessions for this batch
      const batchSessions = allSessions.filter(
        (s) =>
          s.batchCode === batchCode ||
          s.workshopId?.toString() === workshop._id?.toString()
      );

      const formattedSessions =
        batchSessions.length > 0
          ? batchSessions.map((s) => ({
              _id: s._id?.toString(),
              dayNumber: s.dayNumber,
              title: s.title,
              sessionDate: s.sessionDate,
              startTime: s.startTime || '10:00 AM',
              endTime: s.endTime || '3:00 PM',
              timezone: s.timezone || workshop.timezone || 'Asia/Kolkata (IST)',
              instructorName: s.instructorName || workshop.instructor?.name || 'Vikram Malhotra',
              liveSessionUrl: isPaidConfirmed ? s.liveSessionUrl : null,
              meetingPasscode: isPaidConfirmed ? s.meetingPasscode : null,
              status: s.status || 'scheduled',
            }))
          : [
              {
                _id: `${batchCode}-day1`,
                dayNumber: 1,
                title: 'Day 1: LLM Foundations, Prompt Engineering & Custom AI Assistants',
                sessionDate: workshop.startDate,
                startTime: '10:00 AM',
                endTime: '3:00 PM',
                timezone: workshop.timezone || 'Asia/Kolkata (IST)',
                instructorName: workshop.instructor?.name || 'Vikram Malhotra',
                liveSessionUrl: isPaidConfirmed
                  ? workshop.liveSessionUrl || 'https://meet.google.com/ailp-live-cohort'
                  : null,
                meetingPasscode: isPaidConfirmed ? workshop.meetingPasscode || 'AILP2026' : null,
                status: 'scheduled',
              },
              {
                _id: `${batchCode}-day2`,
                dayNumber: 2,
                title: 'Day 2: Multi-Step AI Workflows, Functional Prototyping & Capstone Lab',
                sessionDate: workshop.endDate,
                startTime: '10:00 AM',
                endTime: '3:00 PM',
                timezone: workshop.timezone || 'Asia/Kolkata (IST)',
                instructorName: workshop.instructor?.name || 'Vikram Malhotra',
                liveSessionUrl: isPaidConfirmed
                  ? workshop.liveSessionUrl || 'https://meet.google.com/ailp-live-cohort'
                  : null,
                meetingPasscode: isPaidConfirmed ? workshop.meetingPasscode || 'AILP2026' : null,
                status: 'scheduled',
              },
            ];

      // Map real learning resources categorized into Slides, Notes, Prompt Templates, and Project Resources
      const batchResources = allResources.filter(
        (r) =>
          !['faq', 'testimonial'].includes(r.category) &&
          (r.workshopBatchCode === 'ALL' || !r.workshopBatchCode || r.workshopBatchCode === batchCode)
      );

      const mappedResources = [
        ...batchResources.map((r) => {
          let section: 'slides' | 'notes' | 'prompts' | 'projects' = 'notes';
          if (r.category === 'slide_deck') section = 'slides';
          else if (r.category === 'prompt_template') section = 'prompts';
          else if (r.category === 'code_repo') section = 'projects';
          else if (r.category === 'pdf') section = 'notes';

          return {
            id: r._id?.toString(),
            title: r.title,
            description: r.description,
            category: r.category,
            section,
            type:
              r.category === 'prompt_template'
                ? 'Prompt Template'
                : r.category === 'code_repo'
                ? 'Project Resource'
                : r.category === 'slide_deck'
                ? 'Slide Deck'
                : 'Notes & PDF',
            downloadUrl: isPaidConfirmed ? r.url || '#download-resource' : null,
            content: isPaidConfirmed ? r.content || null : null,
            isGated: !isPaidConfirmed,
          };
        }),
        {
          id: 'res-slide-day1',
          title: 'Day 1 & Day 2 Masterclass Slide Deck (Complete Visual Guide)',
          description:
            '65+ annotated slides covering LLM architectures, context windows, RAG pipelines, and agent patterns.',
          category: 'slide_deck',
          section: 'slides',
          type: 'Slide Deck',
          downloadUrl: isPaidConfirmed ? 'https://ailaunchpad.edu/materials/masterclass-slides.pdf' : null,
          content: isPaidConfirmed
            ? 'Module 1: How Modern LLMs Reason\nModule 2: Zero-Shot & Few-Shot Prompt Architecture\nModule 3: Custom AI Assistants & Grounding\nModule 4: Agentic Workflows & Function Calling'
            : null,
          isGated: !isPaidConfirmed,
        },
      ];

      const primaryJoinUrl =
        formattedSessions[0]?.liveSessionUrl ||
        workshop.liveSessionUrl ||
        'https://meet.google.com/ailp-live-cohort';
      const primaryPasscode =
        formattedSessions[0]?.meetingPasscode || workshop.meetingPasscode || 'AILP2026';

      return {
        _id: enr._id,
        enrollmentId: enr.enrollmentId,
        status: isPaidConfirmed
          ? enr.status
          : enr.status === 'confirmed'
          ? 'pending_payment'
          : enr.status || 'pending_payment',
        paymentStatus: isCaptured ? 'captured' : enr.paymentStatus || 'created',
        isAuthorized: isPaidConfirmed,
        day1Attended: Boolean(enr.day1Attended),
        day2Attended: Boolean(enr.day2Attended),
        workshop: {
          _id: workshop._id,
          title: workshop.title || 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
          batchCode,
          description:
            workshop.description ||
            'Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.',
          startDate: workshop.startDate,
          endDate: workshop.endDate,
          timings: workshop.timings || '10:00 AM – 3:00 PM IST',
          timezone: workshop.timezone || 'Asia/Kolkata (IST)',
          instructor: workshop.instructor || {
            name: 'Vikram Malhotra',
            role: 'Staff AI Engineer & Former ML Lead',
            bio: 'Over 12 years building production software and leading enterprise LLM integrations.',
          },
          price: workshop.price || {
            basePrice: 1999,
            currency: 'INR',
            taxPercentage: 18,
            isFree: false,
          },
        },
        sessions: formattedSessions,
        sessionAccess: {
          isUnlocked: isPaidConfirmed,
          joinUrl: isPaidConfirmed ? primaryJoinUrl : null,
          meetingPasscode: isPaidConfirmed ? primaryPasscode : null,
          platform: 'Google Meet / Zoom HD Virtual Classroom',
          canJoinNow: isPaidConfirmed && isLiveOrUpcoming,
          reason: !isPaidConfirmed
            ? 'Complete enrollment payment to unlock your live classroom seat.'
            : null,
        },
        resources: mappedResources,
      };
    });
  }

  private static async getAvailableWorkshops(): Promise<any[]> {
    let workshops: any[] = [];
    let allResources: any[] = [];
    if (isDBConnected()) {
      try {
        [workshops, allResources] = await Promise.all([
          Workshop.find({ status: 'published' }).sort({ startDate: 1 }),
          LearningResource.find({ isPublished: true }),
        ]);
      } catch (err: any) {
        console.warn('[LearnerController AvailableWorkshops Fallback]', err.message);
      }
    }
    if (workshops.length === 0) {
      workshops = await memoryStore.getPublishedWorkshops();
    }
    if (allResources.length === 0) {
      const memRes = await memoryStore.getAllResources();
      allResources = memRes.filter((r: any) => r.isPublished !== false);
    }

    return workshops.map((w: any) => {
      const batchCode = w.batchCode || 'AILP-2026-NOV-14';
      const batchResources = allResources.filter(
        (r: any) =>
          !['faq', 'testimonial'].includes(r.category) &&
          (r.workshopBatchCode === 'ALL' || !r.workshopBatchCode || r.workshopBatchCode === batchCode)
      );

      // Safe schedule preview for Registered Users (joinUrl and passcode strictly null)
      const sessionsPreview = [
        {
          _id: `${batchCode}-day1`,
          dayNumber: 1,
          title: 'Day 1: LLM Foundations, Prompt Engineering & Custom AI Assistants',
          sessionDate: w.startDate,
          startTime: '10:00 AM',
          endTime: '3:00 PM',
          timezone: w.timezone || 'Asia/Kolkata (IST)',
          instructorName: w.instructor?.name || 'Vikram Malhotra',
          liveSessionUrl: null,
          meetingPasscode: null,
          status: 'scheduled',
        },
        {
          _id: `${batchCode}-day2`,
          dayNumber: 2,
          title: 'Day 2: Multi-Step AI Workflows, Functional Prototyping & Capstone Lab',
          sessionDate: w.endDate,
          startTime: '10:00 AM',
          endTime: '3:00 PM',
          timezone: w.timezone || 'Asia/Kolkata (IST)',
          instructorName: w.instructor?.name || 'Vikram Malhotra',
          liveSessionUrl: null,
          meetingPasscode: null,
          status: 'scheduled',
        },
      ];

      // Safe learning material previews (downloadUrl and content strictly null)
      const materialsPreview = [
        ...batchResources.map((r: any) => {
          let section: 'slides' | 'notes' | 'prompts' | 'projects' = 'notes';
          if (r.category === 'slide_deck') section = 'slides';
          else if (r.category === 'prompt_template') section = 'prompts';
          else if (r.category === 'code_repo') section = 'projects';
          else if (r.category === 'pdf') section = 'notes';

          return {
            id: r._id?.toString(),
            title: r.title,
            description: r.description,
            category: r.category,
            section,
            type:
              r.category === 'prompt_template'
                ? 'Prompt Template'
                : r.category === 'code_repo'
                ? 'Project Resource'
                : r.category === 'slide_deck'
                ? 'Slide Deck'
                : 'Notes & PDF',
            downloadUrl: null,
            content: null,
            isGated: true,
          };
        }),
        {
          id: 'res-slide-day1',
          title: 'Day 1 & Day 2 Masterclass Slide Deck (Complete Visual Guide)',
          description:
            '65+ annotated slides covering LLM architectures, context windows, RAG pipelines, and agent patterns.',
          category: 'slide_deck',
          section: 'slides',
          type: 'Slide Deck',
          downloadUrl: null,
          content: null,
          isGated: true,
        },
      ];

      return {
        _id: w._id?.toString(),
        title: w.title,
        batchCode: w.batchCode,
        description: w.description,
        startDate: w.startDate,
        endDate: w.endDate,
        timings: w.timings || '10:00 AM – 3:00 PM IST',
        timezone: w.timezone || 'Asia/Kolkata (IST)',
        capacity: w.capacity || 60,
        enrolledCount: w.enrolledCount || 0,
        availableSeats:
          w.availableSeats ?? Math.max(0, (w.capacity || 60) - (w.enrolledCount || 0)),
        instructor: w.instructor || {
          name: 'Vikram Malhotra',
          role: 'Staff AI Engineer & Former ML Lead',
          bio: 'Over 12 years building production software and leading enterprise LLM integrations.',
        },
        price: w.price || { basePrice: 1999, currency: 'INR', taxPercentage: 18, isFree: false },
        sessionsPreview,
        materialsPreview,
      };
    });
  }

  static async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;

      const [activeWorkshops, availableWorkshops] = await Promise.all([
        LearnerController.getStudentWorkshops(userId, userEmail),
        LearnerController.getAvailableWorkshops(),
      ]);

      let submissions: any[] = [];
      let certificates: any[] = [];
      let assignments: any[] = [];

      if (isDBConnected()) {
        try {
          if (mongoose.Types.ObjectId.isValid(userId)) {
            [submissions, certificates] = await Promise.all([
              ProjectSubmission.find({ userId }).sort({ createdAt: -1 }),
              Certificate.find({ userId, isRevoked: false }).sort({ createdAt: -1 }),
            ]);
          }
          assignments = await Assignment.find().sort({ dayNumber: 1 });
        } catch (err: any) {
          console.warn('[LearnerController Dashboard Queries]', err.message);
        }
      }

      if (submissions.length === 0) {
        const memSubs = await memoryStore.getAllSubmissions();
        const studentEnrIds = new Set(
          activeWorkshops.flatMap((w) => [w._id?.toString(), w.enrollmentId])
        );
        submissions = memSubs.filter(
          (s) => s.userId === userId || studentEnrIds.has(s.enrollmentId)
        );
      }

      if (certificates.length === 0) {
        const memCerts = await memoryStore.getAllCertificates();
        const studentEnrIds = new Set(
          activeWorkshops.flatMap((w) => [w._id?.toString(), w.enrollmentId])
        );
        certificates = memCerts.filter(
          (c) =>
            !c.isRevoked &&
            (c.userId === userId || studentEnrIds.has(c.enrollmentId?.toString()))
        );
      }

      if (assignments.length === 0) {
        assignments = await memoryStore.getAllAssignments();
      }

      const confirmedWorkshops = activeWorkshops.filter((w) => w.isAuthorized);
      const pendingWorkshops = activeWorkshops.filter((w) => !w.isAuthorized);
      const hasConfirmedEnrollment = confirmedWorkshops.length > 0;
      const hasPendingPayment = !hasConfirmedEnrollment && pendingWorkshops.length > 0;
      const isWorkshopCompleted =
        hasConfirmedEnrollment &&
        (certificates.length > 0 ||
          confirmedWorkshops.some((w) => w.day1Attended && w.day2Attended));

      let userState: 'registered' | 'payment_pending' | 'enrolled' | 'completed' = 'registered';
      if (isWorkshopCompleted) userState = 'completed';
      else if (hasConfirmedEnrollment) userState = 'enrolled';
      else if (hasPendingPayment) userState = 'payment_pending';

      const primaryWorkshop = confirmedWorkshops[0] || activeWorkshops[0] || null;
      const upcomingClass =
        primaryWorkshop?.sessions?.[0] ||
        availableWorkshops[0]?.sessionsPreview?.[0] ||
        null;

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
          userState,
          hasConfirmedEnrollment,
          hasPendingPayment,
          workshops: activeWorkshops,
          availableWorkshops,
          upcomingClass,
          assignments,
          submissions,
          certificates,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/learners/enroll
   * Allows a signed-in Registered User to enroll in a selected workshop batch.
   * Preserves strict verification: paid workshops require payment completion via Razorpay before unlocking content.
   */
  static async enrollInWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user: any = req.user!;
      const { workshopId } = req.body;

      if (!workshopId) {
        throw ApiError.badRequest('Please select a workshop batch to enroll.');
      }

      // Check if user already has an enrollment for this batch
      const existingWorkshops = await LearnerController.getStudentWorkshops(
        user._id.toString(),
        user.email
      );
      const existing = existingWorkshops.find(
        (w) =>
          w.workshop?._id?.toString() === workshopId ||
          w.workshop?.batchCode === workshopId
      );

      if (existing) {
        if (existing.isAuthorized) {
          res.status(200).json({
            success: true,
            message: 'You are already confirmed in this workshop cohort.',
            data: {
              enrollment: existing,
              paymentRequired: false,
            },
          });
          return;
        }
        // Return existing pending enrollment so they can proceed to payment
        res.status(200).json({
          success: true,
          message: 'Seat reserved. Proceed to payment to confirm your enrollment.',
          data: {
            enrollment: existing,
            paymentRequired: true,
          },
        });
        return;
      }

      const result = await EnrollmentService.registerLearner(
        {
          workshopId,
          fullName: user.name || 'Student',
          email: user.email,
          phoneCountryCode: user.phone?.countryCode || '+91',
          phoneNumber: user.phone?.number || '9876543210',
          userCategory: user.userCategory || 'working_professional',
          experienceLevel: user.experienceLevel || 'beginner',
          acceptTerms: true,
          marketingConsent: true,
        },
        user._id.toString()
      );

      res.status(201).json({
        success: true,
        message: result.paymentRequired
          ? 'Seat reserved! Complete payment to unlock your live classes and materials.'
          : 'Free workshop enrollment confirmed! Your student dashboard is unlocked.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dedicated Backend-Enforced Materials Endpoint
   * Verifies that the signed-in student has a confirmed & captured paid enrollment for the target workshop.
   */
  static async getAuthorizedMaterials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const targetEnrollment = req.verifiedEnrollment;
      if (!targetEnrollment || !targetEnrollment.isAuthorized) {
        const userId = req.user!._id.toString();
        const userEmail = req.user!.email;
        const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);
        const requestedTarget =
          (req.params?.workshopId as string) || (req.query?.workshopId as string) || '';

        const authorizedWorkshops = workshops.filter((w) => w.isAuthorized);
        if (requestedTarget) {
          const matched = authorizedWorkshops.find(
            (w) =>
              w.enrollmentId === requestedTarget ||
              w._id?.toString() === requestedTarget ||
              w.workshop?._id?.toString() === requestedTarget ||
              w.workshop?.batchCode === requestedTarget
          );
          if (!matched) {
            throw ApiError.forbidden(
              `Access denied: You do not have a confirmed paid enrollment for workshop '${requestedTarget}'.`
            );
          }
          res.status(200).json({
            success: true,
            workshopId: matched.workshop?._id,
            batchCode: matched.workshop?.batchCode,
            data: matched.resources,
          });
          return;
        }

        if (authorizedWorkshops.length === 0) {
          throw ApiError.forbidden(
            'Access denied: Confirmed enrollment and verified captured payment are required to access paid learning materials.'
          );
        }

        res.status(200).json({
          success: true,
          workshopId: authorizedWorkshops[0].workshop?._id,
          batchCode: authorizedWorkshops[0].workshop?.batchCode,
          data: authorizedWorkshops[0].resources,
        });
        return;
      }

      res.status(200).json({
        success: true,
        workshopId: targetEnrollment.workshop?._id,
        batchCode: targetEnrollment.workshop?.batchCode,
        data: targetEnrollment.resources,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dedicated Backend-Enforced Live Classes Endpoint
   * Verifies that the signed-in student has a confirmed & captured paid enrollment before returning live meeting credentials.
   */
  static async getAuthorizedLiveClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;
      const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);
      const requestedTarget =
        (req.params?.workshopId as string) || (req.query?.workshopId as string) || '';

      const authorizedWorkshops = workshops.filter((w) => w.isAuthorized);
      if (requestedTarget) {
        const matched = authorizedWorkshops.find(
          (w) =>
            w.enrollmentId === requestedTarget ||
            w._id?.toString() === requestedTarget ||
            w.workshop?._id?.toString() === requestedTarget ||
            w.workshop?.batchCode === requestedTarget
        );
        if (!matched) {
          throw ApiError.forbidden(
            `Access denied: You do not have a confirmed paid enrollment for workshop '${requestedTarget}'.`
          );
        }
        res.status(200).json({
          success: true,
          data: [
            {
              enrollmentId: matched.enrollmentId,
              workshop: matched.workshop,
              sessions: matched.sessions,
              sessionAccess: matched.sessionAccess,
            },
          ],
        });
        return;
      }

      if (authorizedWorkshops.length === 0) {
        throw ApiError.forbidden(
          'Access denied: Confirmed enrollment and verified captured payment are required to access live class credentials.'
        );
      }

      res.status(200).json({
        success: true,
        data: authorizedWorkshops.map((w) => ({
          enrollmentId: w.enrollmentId,
          workshop: w.workshop,
          sessions: w.sessions,
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
      const { enrollmentId, workshopId, projectTitle, repositoryUrl, liveDemoUrl, notes } = req.body;

      if (!projectTitle || !projectTitle.trim()) {
        throw ApiError.badRequest('Project title is required.');
      }

      const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);
      const requestedTarget = enrollmentId || workshopId || '';

      let targetEnrollment: any = null;
      if (requestedTarget) {
        targetEnrollment = workshops.find(
          (w) =>
            w.enrollmentId === requestedTarget ||
            w._id?.toString() === requestedTarget ||
            w.workshop?._id?.toString() === requestedTarget ||
            w.workshop?.batchCode === requestedTarget
        );
        if (!targetEnrollment) {
          throw ApiError.forbidden(
            `Access denied: You do not have an enrollment in workshop '${requestedTarget}'.`
          );
        }
      } else {
        targetEnrollment = workshops.find((w) => w.isAuthorized) || workshops[0];
      }

      if (!targetEnrollment) {
        throw ApiError.forbidden(
          'Access denied: Confirmed workshop enrollment and verified payment are required to submit assignments.'
        );
      }

      if (!targetEnrollment.isAuthorized) {
        throw ApiError.forbidden(
          'Only students with confirmed enrollment and verified captured payment can submit capstone assignments.'
        );
      }

      if (
        isDBConnected() &&
        mongoose.Types.ObjectId.isValid(userId) &&
        mongoose.Types.ObjectId.isValid(targetEnrollment._id)
      ) {
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

      const savedInMem = await memoryStore.saveSubmission({
        enrollmentId: targetEnrollment.enrollmentId,
        workshopId: targetEnrollment.workshop?._id,
        batchCode: targetEnrollment.workshop?.batchCode,
        userId,
        projectTitle: projectTitle.trim(),
        repositoryUrl,
        liveDemoUrl,
        notes,
        status: 'submitted',
      });

      res.status(201).json({
        success: true,
        message: 'Capstone project submitted successfully. It is now queued for mentor review.',
        data: savedInMem,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMySubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const userEmail = req.user!.email;
      let submissions: any[] = [];

      if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
        submissions = await ProjectSubmission.find({ userId })
          .populate('workshopId', 'title batchCode')
          .sort({ createdAt: -1 });
      }

      if (submissions.length === 0) {
        const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);
        const studentEnrIds = new Set(workshops.flatMap((w) => [w._id?.toString(), w.enrollmentId]));
        const memSubs = await memoryStore.getAllSubmissions();
        submissions = memSubs.filter(
          (s) => s.userId === userId || studentEnrIds.has(s.enrollmentId)
        );
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
      const userEmail = req.user!.email;
      let certificates: any[] = [];

      if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
        certificates = await Certificate.find({
          userId,
          isRevoked: false,
        }).sort({ createdAt: -1 });
      }

      if (certificates.length === 0) {
        const workshops = await LearnerController.getStudentWorkshops(userId, userEmail);
        const studentEnrIds = new Set(workshops.flatMap((w) => [w._id?.toString(), w.enrollmentId]));
        const memCerts = await memoryStore.getAllCertificates();
        certificates = memCerts.filter(
          (c) =>
            !c.isRevoked &&
            (c.userId === userId || studentEnrIds.has(c.enrollmentId?.toString()))
        );
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

  /**
   * Protected Certificate Download Endpoint
   * Requires verified enrollment payment AND verified workshop completion.
   */
  static async downloadCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const targetEnrollment = req.verifiedEnrollment;

      if (!targetEnrollment || !targetEnrollment.isAuthorized) {
        throw ApiError.forbidden(
          'Access denied: Confirmed workshop enrollment and verified payment are required.'
        );
      }

      const [memCerts, memSubs] = await Promise.all([
        memoryStore.getAllCertificates(),
        memoryStore.getAllSubmissions(),
      ]);
      const cert = memCerts.find(
        (c: any) =>
          !c.isRevoked &&
          (c.userId === userId || c.enrollmentId === targetEnrollment.enrollmentId)
      );
      const hasSubmission = memSubs.some(
        (s: any) =>
          s.userId === userId &&
          (s.enrollmentId === targetEnrollment.enrollmentId ||
            s.workshopId === targetEnrollment.workshop?._id?.toString() ||
            s.batchCode === targetEnrollment.workshop?.batchCode)
      );

      if (!cert && !hasSubmission && !(targetEnrollment.day1Attended && targetEnrollment.day2Attended)) {
        throw ApiError.forbidden(
          'Certificate locked: Verified completion of Day 1 & Day 2 sessions and capstone submission are required.'
        );
      }

      res.status(200).json({
        success: true,
        data: cert || {
          serialNumber: `AILP-CERT-${targetEnrollment.enrollmentId}`,
          recipientName: req.user?.name || 'Student',
          workshopTitle: targetEnrollment.workshop?.title,
          batchCode: targetEnrollment.workshop?.batchCode,
          issuedAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const payments = await PaymentService.getMyPayments(userId);

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

      if (submissions.length === 0) {
        const studentEnrIds = new Set(workshops.flatMap((w) => [w._id?.toString(), w.enrollmentId]));
        submissions = (await memoryStore.getAllSubmissions()).filter(
          (s) => s.userId === userId || studentEnrIds.has(s.enrollmentId)
        );
      }

      if (certificates.length === 0) {
        const studentEnrIds = new Set(workshops.flatMap((w) => [w._id?.toString(), w.enrollmentId]));
        certificates = (await memoryStore.getAllCertificates()).filter(
          (c) => !c.isRevoked && (c.userId === userId || studentEnrIds.has(c.enrollmentId?.toString()))
        );
      }

      const progress = workshops.map((enr: any) => {
        const hasDay1 = attendance.some(
          (a: any) =>
            (a.enrollmentId?.toString() === enr._id?.toString() ||
              a.enrollmentId?.toString() === enr.enrollmentId) &&
            a.dayNumber === 1 &&
            a.status === 'present'
        );
        const hasDay2 = attendance.some(
          (a: any) =>
            (a.enrollmentId?.toString() === enr._id?.toString() ||
              a.enrollmentId?.toString() === enr.enrollmentId) &&
            a.dayNumber === 2 &&
            a.status === 'present'
        );
        const hasSubmitted = submissions.some(
          (s: any) =>
            s.enrollmentId?.toString() === enr._id?.toString() ||
            s.enrollmentId?.toString() === enr.enrollmentId
        );
        const hasCert = certificates.some(
          (c: any) =>
            c.enrollmentId?.toString() === enr._id?.toString() ||
            c.enrollmentId?.toString() === enr.enrollmentId
        );

        let score = enr.isAuthorized ? 25 : 0;
        if (hasDay1) score += 25;
        if (hasDay2) score += 25;
        if (hasSubmitted) score += 15;
        if (hasCert) score += 10;

        const isEligibleForCertificate = Boolean(enr.isAuthorized && hasSubmitted);

        return {
          enrollmentId: enr.enrollmentId,
          workshopTitle: enr.workshop?.title || 'AI Launchpad Bootcamp',
          batchCode: enr.workshop?.batchCode || 'AILP-COHORT',
          percentage: Math.min(score, 100),
          isAuthorized: enr.isAuthorized,
          day1Attended: hasDay1,
          day2Attended: hasDay2,
          projectSubmitted: hasSubmitted,
          isEligibleForCertificate,
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
