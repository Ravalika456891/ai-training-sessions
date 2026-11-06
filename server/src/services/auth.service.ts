import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUser } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/jwt.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import { isDBConnected } from '../config/db.js';
import { memoryStore } from './memoryStore.js';
import mongoose from 'mongoose';

export class AuthService {
  static async register(input: RegisterInput): Promise<{ user: any; token: string }> {
    const email = input.email.toLowerCase().trim();

    // 1. If MongoDB is connected, attempt database registration
    if (isDBConnected()) {
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw ApiError.conflict('An account with this email address already exists.');
        }

        let passwordHash: string | undefined;
        if (input.password) {
          passwordHash = await bcrypt.hash(input.password, 10);
        }

        const user = await User.create({
          name: input.name,
          email,
          passwordHash,
          phone: input.phone,
          userCategory: input.userCategory || 'working_professional',
          experienceLevel: input.experienceLevel || 'beginner',
          marketingConsent: input.marketingConsent || false,
          role: 'learner',
        });

        const token = signToken({
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
        });

        return {
          user: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            userCategory: user.userCategory,
            experienceLevel: user.experienceLevel,
            createdAt: user.createdAt,
          },
          token,
        };
      } catch (err: any) {
        if (err.statusCode) throw err;
        console.warn('[MongoDB Registration Fallback]', err.message);
      }
    }

    // 2. In-Memory Store Fallback (Guarantees Sign-up always succeeds even without live MongoDB)
    const existingMemUser = await memoryStore.findUserByEmail(email);
    if (existingMemUser) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    const memUser = await memoryStore.createUser({
      name: input.name,
      email,
      password: input.password,
      phone: input.phone,
      userCategory: input.userCategory,
      experienceLevel: input.experienceLevel,
      marketingConsent: input.marketingConsent,
      role: 'learner',
    });

    const token = signToken({
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role,
    });

    return {
      user: {
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone,
        role: memUser.role,
        userCategory: memUser.userCategory,
        experienceLevel: memUser.experienceLevel,
        createdAt: memUser.createdAt,
      },
      token,
    };
  }

  static async login(input: LoginInput): Promise<{ user: any; token: string }> {
    const email = input.email.toLowerCase().trim();

    // 1. Try MongoDB if connected
    if (isDBConnected()) {
      try {
        const user = await User.findOne({ email }).select('+passwordHash');
        if (user) {
          if (!user.passwordHash) {
            throw ApiError.unauthorized('This account was created via direct registration. Please register or reset password.');
          }

          const isMatch = await user.comparePassword(input.password);
          if (!isMatch) {
            throw ApiError.unauthorized('Invalid email or password.');
          }

          const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
          });

          return {
            user: {
              _id: user._id.toString(),
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              userCategory: user.userCategory,
              experienceLevel: user.experienceLevel,
              createdAt: user.createdAt,
            },
            token,
          };
        }
      } catch (err: any) {
        if (err.statusCode) throw err;
        console.warn('[MongoDB Login Fallback]', err.message);
      }
    }

    // 2. Try In-Memory Store (Includes pre-seeded Admin & newly registered in-memory users)
    const memUser = await memoryStore.findUserByEmail(email);
    if (!memUser) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const isMatch = await memUser.comparePassword(input.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = signToken({
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role,
    });

    return {
      user: {
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone,
        role: memUser.role,
        userCategory: memUser.userCategory,
        experienceLevel: memUser.experienceLevel,
        createdAt: memUser.createdAt,
      },
      token,
    };
  }

  static async googleAuth(input: {
    credential?: string;
    email?: string;
    name?: string;
    googleId?: string;
    avatarUrl?: string;
  }): Promise<{ user: any; token: string }> {
    let payload: any = null;

    // Decode Google ID token JWT if supplied
    if (input.credential) {
      try {
        const parts = input.credential.split('.');
        if (parts.length === 3) {
          const jsonStr = Buffer.from(parts[1], 'base64url').toString('utf8');
          payload = JSON.parse(jsonStr);
        }
      } catch (err) {
        console.warn('[Google JWT Parse Warning]', err);
      }
    }

    const email = (payload?.email || input.email || '').toLowerCase().trim();
    if (!email) {
      throw ApiError.badRequest('A valid email address is required for Google Sign-In.');
    }

    const name = payload?.name || input.name || email.split('@')[0];
    const googleId = payload?.sub || input.googleId || `g_${Date.now()}`;
    const avatarUrl = payload?.picture || input.avatarUrl;

    // 1. Try MongoDB if connected
    if (isDBConnected()) {
      try {
        let user = await User.findOne({
          $or: [{ email }, { googleId }],
        });

        if (user) {
          if (!user.googleId) {
            user.googleId = googleId;
            if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
            await user.save();
          }
        } else {
          user = await User.create({
            name,
            email,
            googleId,
            avatarUrl,
            role: 'learner',
            userCategory: 'working_professional',
            experienceLevel: 'beginner',
            marketingConsent: true,
          });
        }

        const token = signToken({
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
        });

        return {
          user: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            role: user.role,
            userCategory: user.userCategory,
            experienceLevel: user.experienceLevel,
            createdAt: user.createdAt,
          },
          token,
        };
      } catch (dbErr: any) {
        console.warn('[MongoDB Google Auth Fallback]', dbErr.message);
      }
    }

    // 2. Fallback to Memory Store
    let memUser = await memoryStore.findUserByEmail(email);
    if (!memUser) {
      memUser = await memoryStore.createUser({
        name,
        email,
        googleId,
        avatarUrl,
        role: 'learner',
        marketingConsent: true,
      });
    }

    const token = signToken({
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role,
    });

    return {
      user: {
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone,
        avatarUrl: memUser.avatarUrl,
        role: memUser.role,
        userCategory: memUser.userCategory,
        experienceLevel: memUser.experienceLevel,
        createdAt: memUser.createdAt,
      },
      token,
    };
  }

  static async getMe(userId: string): Promise<any> {
    if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const user = await User.findById(userId);
        if (user) {
          return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            userCategory: user.userCategory,
            experienceLevel: user.experienceLevel,
            createdAt: user.createdAt,
          };
        }
      } catch (err: any) {
        console.warn('[MongoDB getMe Fallback]', err.message);
      }
    }

    const memUser = await memoryStore.findUserById(userId);
    if (memUser) {
      return {
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        phone: memUser.phone,
        role: memUser.role,
        userCategory: memUser.userCategory,
        experienceLevel: memUser.experienceLevel,
        createdAt: memUser.createdAt,
      };
    }

    throw ApiError.notFound('User not found.');
  }

  static async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    if (isDBConnected()) {
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user) {
          user.resetPasswordToken = hashedToken;
          user.resetPasswordExpires = expiry;
          await user.save();
        }
      } catch (err) {
        console.warn('[MongoDB forgotPassword fallback]', err);
      }
    }

    const memUser = await memoryStore.findUserByEmail(normalizedEmail);
    if (memUser) {
      memUser.resetPasswordToken = hashedToken;
      memUser.resetPasswordExpires = expiry;
    }

    return {
      message: 'If an account exists for this email, password reset instructions have been generated.',
      resetToken: rawToken,
    };
  }

  static async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token || !newPassword) {
      throw ApiError.badRequest('Reset token and new password are required.');
    }
    if (newPassword.length < 8) {
      throw ApiError.badRequest('Password must be at least 8 characters with letters and numbers.');
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const passwordHash = await bcrypt.hash(newPassword, 10);

    if (isDBConnected()) {
      try {
        const user = await User.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: new Date() },
        });

        if (user) {
          user.passwordHash = passwordHash;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          await user.save();

          return { message: 'Password has been reset successfully. You can now sign in.' };
        }
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    // Memory store fallback
    const memUser = await memoryStore.findUserByResetToken(hashedToken);

    if (!memUser) {
      throw ApiError.badRequest('Password reset token is invalid or has expired.');
    }

    memUser.passwordHash = passwordHash;
    memUser.resetPasswordToken = undefined;
    memUser.resetPasswordExpires = undefined;

    return { message: 'Password has been reset successfully. You can now sign in.' };
  }

  static async updateProfile(userId: string, data: { name?: string; phone?: any; experienceLevel?: any; userCategory?: any }): Promise<any> {
    if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const user = await User.findById(userId);
        if (user) {
          if (data.name) user.name = data.name.trim();
          if (data.phone) user.phone = data.phone;
          if (data.experienceLevel) user.experienceLevel = data.experienceLevel;
          if (data.userCategory) user.userCategory = data.userCategory;
          await user.save();
          return this.getMe(userId);
        }
      } catch (err) {
        console.warn('[MongoDB updateProfile fallback]', err);
      }
    }

    const memUser = await memoryStore.findUserById(userId);
    if (memUser) {
      if (data.name) memUser.name = data.name.trim();
      if (data.phone) memUser.phone = data.phone;
      if (data.experienceLevel) memUser.experienceLevel = data.experienceLevel;
      if (data.userCategory) memUser.userCategory = data.userCategory;
      return this.getMe(userId);
    }

    throw ApiError.notFound('User not found.');
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('Current password and new password are required.');
    }
    if (newPassword.length < 8) {
      throw ApiError.badRequest('New password must be at least 8 characters.');
    }

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const user = await User.findById(userId).select('+passwordHash');
        if (user && user.passwordHash) {
          const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
          if (!isMatch) {
            throw ApiError.badRequest('Incorrect current password.');
          }
          user.passwordHash = await bcrypt.hash(newPassword, 10);
          await user.save();
          return { message: 'Password changed successfully.' };
        }
      } catch (err: any) {
        if (err.statusCode) throw err;
      }
    }

    const memUser = await memoryStore.findUserById(userId);
    if (memUser && memUser.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, memUser.passwordHash);
      if (!isMatch) {
        throw ApiError.badRequest('Incorrect current password.');
      }
      memUser.passwordHash = await bcrypt.hash(newPassword, 10);
      return { message: 'Password changed successfully.' };
    }

    throw ApiError.badRequest('Password could not be updated for this account.');
  }
}
