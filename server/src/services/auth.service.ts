import bcrypt from 'bcryptjs';
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
}
