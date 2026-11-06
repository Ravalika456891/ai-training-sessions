import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { LearnerController } from '../controllers/learner.controller.js';
import { LearningResource } from '../models/LearningResource.js';
import { isDBConnected } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';

export interface AccessControlOptions {
  requireCompletion?: boolean;
  resourceType?: 'live_class' | 'material' | 'assignment' | 'certificate';
}

declare global {
  namespace Express {
    interface Request {
      verifiedEnrollment?: any;
      verifiedWorkshops?: any[];
    }
  }
}

/**
 * 5-Step Backend Access Control Middleware for Protected Workshop Content
 * Checks:
 *  A. Is the user authenticated?
 *  B. Does the user have a confirmed enrollment in the target workshop?
 *  C. Is the required payment verified and captured (never created/authorized/pending)?
 *  D. Does the requested resource belong to that enrolled workshop?
 *  E. Is the resource currently available under its release / completion policy?
 */
export const requireVerifiedWorkshopAccess = (options: AccessControlOptions = {}) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      // A. Is the user authenticated?
      if (!req.user || !req.user._id) {
        throw ApiError.unauthorized('Authentication required. Please sign in to continue.');
      }

      const userId = req.user._id.toString();
      const userEmail = req.user.email;

      const studentWorkshops = await LearnerController.getStudentWorkshops(userId, userEmail);

      // Identify requested workshop / enrollment target (if specified in params, query, or body)
      const requestedTarget =
        (req.params?.workshopId as string) ||
        (req.query?.workshopId as string) ||
        (req.body?.workshopId as string) ||
        (req.body?.enrollmentId as string) ||
        '';

      // Filter enrollments that are BOTH confirmed AND have verified captured payment
      const verifiedEnrollments = studentWorkshops.filter((w: any) => {
        const isConfirmedStatus = w.status === 'confirmed' || w.status === 'completed' || w.status === 'attended';
        const isCapturedPayment =
          w.paymentStatus === 'captured' ||
          w.paymentStatus === 'completed' ||
          w.paymentStatus === 'paid' ||
          w.paymentStatus === 'free';
        // Never treat 'created', 'authorized', 'pending', or 'failed' as paid!
        return isConfirmedStatus && isCapturedPayment && w.isAuthorized === true;
      });

      // B & C. Check confirmed enrollment & verified captured payment for the target workshop
      let targetEnrollment: any = null;

      if (requestedTarget) {
        const matchingAnyEnrollment = studentWorkshops.find(
          (w: any) =>
            w.enrollmentId === requestedTarget ||
            w._id?.toString() === requestedTarget ||
            w.workshop?._id?.toString() === requestedTarget ||
            w.workshop?.batchCode === requestedTarget
        );

        targetEnrollment = verifiedEnrollments.find(
          (w: any) =>
            w.enrollmentId === requestedTarget ||
            w._id?.toString() === requestedTarget ||
            w.workshop?._id?.toString() === requestedTarget ||
            w.workshop?.batchCode === requestedTarget
        );

        if (!targetEnrollment) {
          if (matchingAnyEnrollment) {
            throw ApiError.forbidden(
              `Access denied: Your enrollment (${matchingAnyEnrollment.enrollmentId}) has status '${matchingAnyEnrollment.status}' and payment status '${matchingAnyEnrollment.paymentStatus}'. Verified captured payment is required to unlock protected workshop content.`
            );
          }
          throw ApiError.forbidden(
            `Access denied: You do not have a confirmed paid enrollment for workshop '${requestedTarget}'. Enrolling in one workshop does not unlock another workshop.`
          );
        }
      } else {
        if (verifiedEnrollments.length === 0) {
          const pendingEnr = studentWorkshops[0];
          if (pendingEnr) {
            throw ApiError.forbidden(
              `Access denied: Payment verification pending (current status: ${pendingEnr.paymentStatus}). Complete Razorpay payment to unlock workshop access.`
            );
          }
          throw ApiError.forbidden(
            'Access denied: Confirmed workshop enrollment and verified payment are required.'
          );
        }
        targetEnrollment = verifiedEnrollments[0];
      }

      const enrolledBatchCode = targetEnrollment.workshop?.batchCode;
      const enrolledWorkshopId = targetEnrollment.workshop?._id?.toString();

      // D & E. Check resource ownership and release policy if a specific resourceId is requested
      const requestedResourceId =
        (req.params?.resourceId as string) || (req.query?.resourceId as string);

      if (requestedResourceId) {
        let resource: any = null;
        if (isDBConnected()) {
          try {
            resource = await LearningResource.findById(requestedResourceId);
          } catch {
            // fallback
          }
        }
        if (!resource) {
          const allMemRes = await memoryStore.getAllResources();
          resource = allMemRes.find((r: any) => r._id?.toString() === requestedResourceId);
        }

        if (!resource) {
          throw ApiError.notFound('Requested learning resource was not found.');
        }

        // D. Does the requested resource belong to that enrolled workshop?
        const resBatch = resource.workshopBatchCode;
        const resWsId = resource.workshopId?.toString();
        if (
          resBatch &&
          resBatch !== 'ALL' &&
          resBatch !== enrolledBatchCode &&
          (!resWsId || resWsId !== enrolledWorkshopId)
        ) {
          throw ApiError.forbidden(
            `Access denied: This resource belongs to cohort '${resBatch}', which you are not enrolled in.`
          );
        }

        // E. Is the resource currently available under its release policy?
        if (resource.isPublished === false) {
          throw ApiError.forbidden('Access denied: This resource is not yet published.');
        }
        if (resource.releaseAt && new Date(resource.releaseAt) > new Date()) {
          throw ApiError.forbidden(
            `Access denied: This resource is scheduled for release on ${new Date(
              resource.releaseAt
            ).toLocaleDateString()}.`
          );
        }
      }

      // E (Completion Policy). If certificate access is requested, verify completion requirements
      if (options.requireCompletion || options.resourceType === 'certificate') {
        const [certs, subs] = await Promise.all([
          memoryStore.getAllCertificates(),
          memoryStore.getAllSubmissions(),
        ]);
        const hasIssuedCert = certs.some(
          (c: any) =>
            !c.isRevoked &&
            (c.userId === userId || c.enrollmentId === targetEnrollment.enrollmentId)
        );
        const hasSubmission = subs.some(
          (s: any) =>
            s.userId === userId &&
            (s.enrollmentId === targetEnrollment.enrollmentId ||
              s.workshopId === enrolledWorkshopId ||
              s.batchCode === enrolledBatchCode)
        );
        const isCompleted =
          Boolean(targetEnrollment.day1Attended && targetEnrollment.day2Attended) ||
          targetEnrollment.status === 'completed' ||
          hasIssuedCert ||
          hasSubmission;

        if (!isCompleted) {
          throw ApiError.forbidden(
            'Certificate locked: Verified completion of Day 1 & Day 2 sessions and capstone project submission are required before certificate issuance.'
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

