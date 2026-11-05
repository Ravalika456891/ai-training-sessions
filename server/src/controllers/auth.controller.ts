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

  static async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, token } = await AuthService.googleAuth(req.body);
      setAuthCookie(res, token);

      res.status(200).json({
        success: true,
        message: 'Signed in with Google successfully.',
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

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await AuthService.updateProfile(req.user!._id.toString(), req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(
        req.user!._id.toString(),
        currentPassword,
        newPassword
      );
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

