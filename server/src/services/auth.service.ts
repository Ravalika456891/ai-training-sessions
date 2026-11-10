import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { Registration } from '../models/Registration.js';
import { Enrollment } from '../models/Enrollment.js';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/jwt.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import { isDBConnected } from '../config/db.js';
import { env } from '../config/env.js';
import { memoryStore } from './memoryStore.js';
import mongoose from 'mongoose';

function formatDisplayNameFromEmail(email: string): string {
  const prefix = (email.split('@')[0] || 'Learner').replace(/[._-]+/g, ' ').trim();
  const capitalized = prefix
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  const finalName = capitalized || 'Student';
  return finalName.length >= 2 ? finalName : `${finalName} Learner`;
}

function createRegistrationProof(user: {
  _id: string;
  email: string;
  name: string;
  passwordHash?: string;
  phone?: any;
  userCategory?: string;
  experienceLevel?: string;
}): string {
  return jwt.sign(
    {
      type: 'reg_proof',
      _id: user._id,
      email: user.email.toLowerCase().trim(),
      name: user.name,
      passwordHash: user.passwordHash,
      phone: user.phone,
      userCategory: user.userCategory,
      experienceLevel: user.experienceLevel,
    },
    env.JWT_SECRET,
    { expiresIn: '365d' }
  );
}

function verifyRegistrationProof(proofToken?: string, expectedEmail?: string): any | null {
  if (!proofToken) return null;
  try {
    const decoded: any = jwt.verify(proofToken, env.JWT_SECRET);
    if (decoded?.type !== 'reg_proof') return null;
    if (expectedEmail && decoded.email?.toLowerCase().trim() !== expectedEmail.toLowerCase().trim()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export class AuthService {
  static async register(input: RegisterInput): Promise<{ user: any; token: string; registrationProof: string }> {
    const email = input.email.toLowerCase().trim();
    const rawName = (input.name || formatDisplayNameFromEmail(email)).trim();
    const safeName = rawName.length >= 2 ? rawName : `${rawName} Learner`;

    // 1. If MongoDB is connected, attempt database registration or update existing learner record
    if (isDBConnected()) {
      try {
        let user = await User.findOne({ email }).select('+passwordHash');
        let passwordHash: string | undefined;
        if (input.password) {
          passwordHash = await bcrypt.hash(input.password, 10);
        }

        if (user) {
          if (user.role === 'admin') {
            throw ApiError.conflict('An administrator account with this email address already exists.');
          }
          user.name = safeName || user.name;
          if (passwordHash) {
            user.passwordHash = passwordHash;
          }
          if (input.phone) {
            user.phone = input.phone as { countryCode: string; number: string };
          }
          if (input.userCategory) user.userCategory = input.userCategory;
          if (input.experienceLevel) user.experienceLevel = input.experienceLevel;
          await user.save();
        } else {
          user = await User.create({
            name: safeName,
            email,
            passwordHash,
            phone: input.phone as { countryCode: string; number: string } | undefined,
            userCategory: input.userCategory || 'working_professional',
            experienceLevel: input.experienceLevel || 'beginner',
            marketingConsent: input.marketingConsent || false,
            role: 'learner',
          });
        }

        // Also mirror into memoryStore
        const existingMem = await memoryStore.findUserByEmail(email);
        if (!existingMem) {
          await memoryStore.createUser({
            name: user.name,
            email,
            password: input.password,
            phone: user.phone,
            userCategory: user.userCategory,
            experienceLevel: user.experienceLevel,
            marketingConsent: user.marketingConsent,
            role: 'learner',
          });
        } else if (passwordHash && existingMem.role !== 'admin') {
          existingMem.name = user.name;
          existingMem.passwordHash = passwordHash;
        }

        const token = signToken({
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          phone: user.phone,
          userCategory: user.userCategory,
          experienceLevel: user.experienceLevel,
        });

        const registrationProof = createRegistrationProof({
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          passwordHash: passwordHash || user.passwordHash,
          phone: user.phone,
          userCategory: user.userCategory,
          experienceLevel: user.experienceLevel,
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
          registrationProof,
        };
      } catch (err: any) {
        if (err.statusCode) throw err;
        console.warn('[MongoDB Registration Fallback]', err.message);
      }
    }

    // 2. In-Memory Store Fallback (Guarantees Sign-up always succeeds even without live MongoDB)
    let memUser = await memoryStore.findUserByEmail(email);
    if (memUser) {
      if (memUser.role === 'admin') {
        throw ApiError.conflict('An administrator account with this email address already exists.');
      }
      memUser.name = safeName || memUser.name;
      if (input.password) {
        memUser.passwordHash = await bcrypt.hash(input.password, 10);
      }
      if (input.phone) {
        memUser.phone = input.phone as { countryCode: string; number: string };
      }
    } else {
      memUser = await memoryStore.createUser({
        name: safeName,
        email,
        password: input.password,
        phone: input.phone as { countryCode: string; number: string } | undefined,
        userCategory: input.userCategory,
        experienceLevel: input.experienceLevel,
        marketingConsent: input.marketingConsent,
        role: 'learner',
      });
    }

    const token = signToken({
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role,
      name: memUser.name,
      phone: memUser.phone,
      userCategory: memUser.userCategory,
      experienceLevel: memUser.experienceLevel,
    });

    const registrationProof = createRegistrationProof({
      _id: memUser._id,
      email: memUser.email,
      name: memUser.name,
      passwordHash: memUser.passwordHash,
      phone: memUser.phone,
      userCategory: memUser.userCategory,
      experienceLevel: memUser.experienceLevel,
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
      registrationProof,
    };
  }

  static async login(input: LoginInput): Promise<{ user: any; token: string; registrationProof?: string }> {
    const email = input.email.toLowerCase().trim();
    const verifiedProof = verifyRegistrationProof(input.registrationProof, email);

    // 1. Try MongoDB if connected
    if (isDBConnected()) {
      try {
        let user = await User.findOne({ email }).select('+passwordHash');

        if (!user && verifiedProof) {
          user = await User.create({
            name: verifiedProof.name || formatDisplayNameFromEmail(email),
            email,
            passwordHash: verifiedProof.passwordHash,
            phone: verifiedProof.phone || { countryCode: '+91', number: '' },
            role: 'learner',
            userCategory: verifiedProof.userCategory || 'working_professional',
            experienceLevel: verifiedProof.experienceLevel || 'beginner',
            marketingConsent: true,
          });
        }

        if (!user) {
          // Check if the learner registered via the Workshop Registration / Enrollment form
          const existingReg = await Registration.findOne({ email }).sort({ createdAt: -1 });
          const existingEnr = !existingReg
            ? await Enrollment.findOne({ 'attendeeDetails.email': email }).sort({ createdAt: -1 })
            : null;

          if (existingReg || existingEnr) {
            const regName =
              existingReg?.name ||
              existingEnr?.attendeeDetails?.fullName ||
              formatDisplayNameFromEmail(email);
            const passwordHash = await bcrypt.hash(input.password, 10);
            user = await User.create({
              name: regName.length >= 2 ? regName : `${regName} Learner`,
              email,
              passwordHash,
              phone: existingReg?.phone ? { countryCode: '+91', number: existingReg.phone } : { countryCode: '+91', number: '' },
              role: 'learner',
              userCategory: 'working_professional',
              experienceLevel: 'beginner',
              marketingConsent: true,
            });
          }
        }

        if (user) {
          if (!user.passwordHash) {
            user.passwordHash = await bcrypt.hash(input.password, 10);
            await user.save();
          } else {
            const isMatch = await user.comparePassword(input.password);
            if (!isMatch) {
              throw ApiError.unauthorized('Invalid email or password.');
            }
          }

          const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
            phone: user.phone,
            userCategory: user.userCategory,
            experienceLevel: user.experienceLevel,
          });

          const registrationProof =
            user.role !== 'admin'
              ? createRegistrationProof({
                  _id: user._id.toString(),
                  email: user.email,
                  name: user.name,
                  passwordHash: user.passwordHash,
                  phone: user.phone,
                  userCategory: user.userCategory,
                  experienceLevel: user.experienceLevel,
                })
              : undefined;

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
            registrationProof,
          };
        }
      } catch (err: any) {
        if (err.statusCode) throw err;
        console.warn('[MongoDB Login Fallback]', err.message);
      }
    }

    // 2. Try In-Memory Store (Includes pre-seeded Admin, default students, & serverless registered users)
    let memUser = await memoryStore.findUserByEmail(email);

    // Restore from signed registrationProof if this is a fresh serverless container
    if (!memUser && verifiedProof) {
      memUser = await memoryStore.restoreUserWithHash({
        _id: verifiedProof._id,
        name: verifiedProof.name || formatDisplayNameFromEmail(email),
        email,
        passwordHash: verifiedProof.passwordHash,
        phone: verifiedProof.phone,
        userCategory: verifiedProof.userCategory,
        experienceLevel: verifiedProof.experienceLevel,
      });
    }

    // Also check if user registered via the landing page Registration form in this container
    if (!memUser) {
      const allRegs = await memoryStore.getAllRegistrations();
      const matchedReg = allRegs.find((r) => r.email.toLowerCase() === email);
      if (matchedReg) {
        memUser = await memoryStore.createUser({
          name: matchedReg.name || formatDisplayNameFromEmail(email),
          email,
          password: input.password,
          phone: matchedReg.phone ? { countryCode: '+91', number: matchedReg.phone } : { countryCode: '+91', number: '' },
          role: 'learner',
          userCategory: 'working_professional',
          experienceLevel: 'beginner',
          marketingConsent: true,
        });
      }
    }

    // Strictly reject any unregistered user (e.g. ram@gmail.com)
    if (!memUser) {
      throw ApiError.unauthorized('Account not found. Please create an account first.');
    }

    if (!memUser.passwordHash || memUser.passwordHash === 'no_password_set') {
      memUser.passwordHash = await bcrypt.hash(input.password, 10);
    } else {
      const isMatch = await memUser.comparePassword(input.password);
      if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password.');
      }
    }

    const token = signToken({
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role,
      name: memUser.name,
      phone: memUser.phone,
      userCategory: memUser.userCategory,
      experienceLevel: memUser.experienceLevel,
    });

    const registrationProof =
      memUser.role !== 'admin'
        ? createRegistrationProof({
            _id: memUser._id,
            email: memUser.email,
            name: memUser.name,
            passwordHash: memUser.passwordHash,
            phone: memUser.phone,
            userCategory: memUser.userCategory,
            experienceLevel: memUser.experienceLevel,
          })
        : undefined;

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
      registrationProof,
    };
  }

  static async googleAuth(input: {
    credential?: string;
    email?: string;
    name?: string;
    password?: string;
    googleId?: string;
    avatarUrl?: string;
    mode?: 'login' | 'register';
    registrationProof?: string;
  }): Promise<{ user: any; token: string; registrationProof?: string }> {
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw ApiError.badRequest('Please enter a valid email address (e.g., you@gmail.com).');
    }

    const rawPassword = input.password ? String(input.password) : undefined;

    // When called in sign-in mode (default on /signin), strictly verify existing registered account & password
    if (input.mode !== 'register' && !input.credential) {
      if (!rawPassword) {
        throw ApiError.badRequest('Please enter your password to sign in.');
      }
      return AuthService.login({
        email,
        password: rawPassword,
        registrationProof: input.registrationProof,
      });
    }

    const rawName = (payload?.name || input.name || email.split('@')[0] || 'Learner').trim();
    const name = rawName.length >= 2 ? rawName : `${rawName} Learner`;
    const googleId = payload?.sub || input.googleId || `g_${Date.now()}`;
    const avatarUrl = payload?.picture || input.avatarUrl;

    // 1. Try MongoDB if connected
    if (isDBConnected()) {
      try {
        let user = await User.findOne({
          $or: [{ email }, { googleId }],
        }).select('+passwordHash');

        if (user) {
          let needsSave = false;
          if (!user.googleId) {
            user.googleId = googleId;
            if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
            needsSave = true;
          }
          if (rawPassword) {
            user.passwordHash = await bcrypt.hash(rawPassword, 10);
            needsSave = true;
          }
          if (needsSave) {
            await user.save();
          }
        } else {
          const passwordHash = rawPassword ? await bcrypt.hash(rawPassword, 10) : undefined;
          user = await User.create({
            name,
            email,
            passwordHash,
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
          name: user.name,
          phone: user.phone,
          userCategory: user.userCategory,
          experienceLevel: user.experienceLevel,
        });

        const registrationProof = createRegistrationProof({
          _id: user._id.toString(),
          email: user.email,
          name: user.name,
          passwordHash: user.passwordHash,
          phone: user.phone,
          userCategory: user.userCategory,
          experienceLevel: user.experienceLevel,
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
          registrationProof,
        };
      } catch (dbErr: any) {
        if (dbErr.statusCode) throw dbErr;
        console.warn('[MongoDB Google Auth Fallback]', dbErr.message);
      }
    }

    // 2. Fallback to Memory Store (when mode === 'register')
    let memUser = await memoryStore.findUserByEmail(email);
    if (!memUser) {
      memUser = await memoryStore.createUser({
        name,
        email,
        password: rawPassword,
        googleId,
        avatarUrl,
        role: 'learner',
        marketingConsent: true,
      });
    } else if (rawPassword) {
      memUser.passwordHash = await bcrypt.hash(rawPassword, 10);
    }

    const token = signToken({
      userId: memUser._id,
      email: memUser.email,
      role: memUser.role,
      name: memUser.name,
      phone: memUser.phone,
      userCategory: memUser.userCategory,
      experienceLevel: memUser.experienceLevel,
    });

    const registrationProof = createRegistrationProof({
      _id: memUser._id,
      email: memUser.email,
      name: memUser.name,
      passwordHash: memUser.passwordHash,
      phone: memUser.phone,
      userCategory: memUser.userCategory,
      experienceLevel: memUser.experienceLevel,
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
      registrationProof,
    };
  }

  static async getMe(userId: string, fallbackUser?: any): Promise<any> {
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

    if (fallbackUser) {
      return {
        _id: fallbackUser._id?.toString() || userId,
        name: fallbackUser.name,
        email: fallbackUser.email,
        phone: fallbackUser.phone,
        role: fallbackUser.role || 'learner',
        userCategory: fallbackUser.userCategory || 'working_professional',
        experienceLevel: fallbackUser.experienceLevel || 'beginner',
        createdAt: fallbackUser.createdAt || new Date(),
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

  static async updateProfile(
    userId: string,
    data: { name?: string; phone?: any; experienceLevel?: any; userCategory?: any },
    fallbackUser?: any
  ): Promise<{ user: any; token: string }> {
    let updatedUser: any = null;

    if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const user = await User.findById(userId);
        if (user) {
          if (data.name) user.name = data.name.trim();
          if (data.phone) user.phone = data.phone;
          if (data.experienceLevel) user.experienceLevel = data.experienceLevel;
          if (data.userCategory) user.userCategory = data.userCategory;
          await user.save();
          updatedUser = await this.getMe(userId, user);
        }
      } catch (err) {
        console.warn('[MongoDB updateProfile fallback]', err);
      }
    }

    if (!updatedUser) {
      const memUser = await memoryStore.findUserById(userId);
      if (memUser) {
        if (data.name) memUser.name = data.name.trim();
        if (data.phone) memUser.phone = data.phone;
        if (data.experienceLevel) memUser.experienceLevel = data.experienceLevel;
        if (data.userCategory) memUser.userCategory = data.userCategory;
        updatedUser = await this.getMe(userId, memUser);
      }
    }

    if (!updatedUser && fallbackUser) {
      updatedUser = {
        _id: fallbackUser._id?.toString() || userId,
        name: data.name ? data.name.trim() : fallbackUser.name,
        email: fallbackUser.email,
        phone: data.phone || fallbackUser.phone,
        role: fallbackUser.role || 'learner',
        userCategory: data.userCategory || fallbackUser.userCategory || 'working_professional',
        experienceLevel: data.experienceLevel || fallbackUser.experienceLevel || 'beginner',
        createdAt: fallbackUser.createdAt || new Date(),
      };
    }

    if (!updatedUser) {
      throw ApiError.notFound('User not found.');
    }

    const token = signToken({
      userId: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
      phone: updatedUser.phone,
      userCategory: updatedUser.userCategory,
      experienceLevel: updatedUser.experienceLevel,
    });

    return { user: updatedUser, token };
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
