import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/jwt.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export class AuthService {
  static async register(input: RegisterInput): Promise<{ user: Partial<IUser>; token: string }> {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    let passwordHash: string | undefined;
    if (input.password) {
      passwordHash = await bcrypt.hash(input.password, 10);
    }

    const user = await User.create({
      name: input.name,
      email: input.email,
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
        _id: user._id,
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

  static async login(input: LoginInput): Promise<{ user: Partial<IUser>; token: string }> {
    const user = await User.findOne({ email: input.email }).select('+passwordHash');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (!user.passwordHash) {
      throw ApiError.unauthorized('This account was created via direct registration. Please set a password or use registration.');
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
        _id: user._id,
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

  static async getMe(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      userCategory: user.userCategory,
      experienceLevel: user.experienceLevel,
      createdAt: user.createdAt,
    };
  }
}

