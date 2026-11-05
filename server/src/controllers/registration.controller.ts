import { Request, Response, NextFunction } from 'express';
import { RegistrationService } from '../services/registration.service.js';

export class RegistrationController {
  /**
   * POST /api/registrations
   * Register a participant for a training batch
   */
  static async createRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await RegistrationService.createRegistration(req.body);

      res.status(201).json({
        success: true,
        message: 'Registration confirmed successfully! A confirmation email has been dispatched.',
        data: result.registration,
        emailDispatched: result.emailDispatched,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/registrations
   * Retrieve participant registrations (filterable by email or batchId)
   */
  static async getRegistrations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = typeof req.query.email === 'string' ? req.query.email : undefined;
      const batchId = typeof req.query.batchId === 'string' ? req.query.batchId : undefined;

      const registrations = await RegistrationService.getRegistrations({ email, batchId });

      res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations,
      });
    } catch (error) {
      next(error);
    }
  }
}
