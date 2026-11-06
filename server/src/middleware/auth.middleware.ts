import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { User, IUser } from '../models/User.js';
import { env } from '../config/env.js';
import { isDBConnected } from '../config/db.js';
import { memoryStore } from '../services/memoryStore.js';
import mongoose from 'mongoose';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: IUser | any;
      tokenPayload?: TokenPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.[env.COOKIE_NAME];

    // Fallback to Bearer token in header
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication required. Please sign in.');
    }

    const payload = verifyToken(token);
    req.tokenPayload = payload;

    let user: any = null;
    if (isDBConnected() && mongoose.Types.ObjectId.isValid(payload.userId)) {
      try {
        user = await User.findById(payload.userId);
      } catch (err) {
        console.warn('[Auth Middleware Fallback]', err);
      }
    }

    if (!user) {
      user = await memoryStore.findUserById(payload.userId);
    }

    if (!user && payload.email) {
      user = await memoryStore.findUserByEmail(payload.email);
    }

    // Stateless JWT fallback for serverless multi-instance environments
    if (!user && payload.userId && payload.email) {
      user = {
        _id: payload.userId,
        name: payload.name || payload.email.split('@')[0],
        email: payload.email,
        role: payload.role || 'learner',
        phone: payload.phone || { countryCode: '+91', number: '' },
        userCategory: payload.userCategory || 'working_professional',
        experienceLevel: payload.experienceLevel || 'beginner',
        createdAt: new Date(),
      };
    }

    if (!user) {
      throw ApiError.unauthorized('User account no longer exists.');
    }

    if (user.accountStatus === 'suspended' || user.accountStatus === 'deactivated') {
      throw ApiError.forbidden('Your account has been suspended or deactivated by an administrator.');
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Invalid or expired authentication session.'));
    } else {
      next(error);
    }
  }
};

export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.[env.COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const payload = verifyToken(token);
      req.tokenPayload = payload;

      let user: any = null;
      if (isDBConnected() && mongoose.Types.ObjectId.isValid(payload.userId)) {
        try {
          user = await User.findById(payload.userId);
        } catch {
          // ignore
        }
      }

      if (!user) {
        user = await memoryStore.findUserById(payload.userId);
      }

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch {
    // Continue unauthenticated
    next();
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: requires one of [${allowedRoles.join(', ')}] permissions.`
        )
      );
    }

    next();
  };
};
