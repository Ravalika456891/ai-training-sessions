import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '../services/enrollment.service.js';
import { setAuthCookie } from '../utils/jwt.js';

export class EnrollmentController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await EnrollmentService.registerLearner(
        req.body,
        req.user?._id?.toString()
      );

      // If user was newly created during registration, log them in via cookie
      if (result.token) {
        setAuthCookie(res, result.token);
      }

      res.status(201).json({
        success: true,
        message: result.paymentRequired
          ? 'Registration recorded. Seat reserved for 15 minutes.'
          : 'Enrollment confirmed successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await EnrollmentService.getLearnerEnrollments(
        req.user!._id.toString()
      );

      res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllEnrollments(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await EnrollmentService.getAllEnrollments();

      res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments,
      });
    } catch (error) {
      next(error);
    }
  }
}

