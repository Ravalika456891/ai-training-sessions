import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { setAuthCookie, clearAuthCookie } from '../utils/jwt.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.register(req.body);
      setAuthCookie(res, token);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.login(req.body);
      setAuthCookie(res, token);

      res.status(200).json({
        success: true,
        message: 'Signed in successfully.',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      clearAuthCookie(res);
      res.status(200).json({
        success: true,
        message: 'Signed out successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getMe(req.user!._id.toString());
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

