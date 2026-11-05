import mongoose from 'mongoose';
import { Enrollment, IEnrollment } from '../models/Enrollment.js';
import { Workshop } from '../models/Workshop.js';
import { User, IUser } from '../models/User.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/apiError.js';
import { CreateEnrollmentInput } from '../validators/enrollment.validator.js';
import { signToken } from '../utils/jwt.js';
import { isDBConnected } from '../config/db.js';
import { memoryStore } from './memoryStore.js';

export interface EnrollmentResult {
  enrollment: any;
  user: any;
  workshop: any;
  token?: string; // Generated if user auto-created
  paymentRequired: boolean;
  orderSummary: {
    basePrice: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
  };
}

export class EnrollmentService {
  static async registerLearner(
    input: CreateEnrollmentInput,
    currentUserId?: string
  ): Promise<EnrollmentResult> {
    const email = input.email.toLowerCase().trim();

    // 1. Identify Workshop
    let workshop: any = null;

    if (isDBConnected()) {
      try {
        if (mongoose.Types.ObjectId.isValid(input.workshopId)) {
          workshop = await Workshop.findById(input.workshopId);
        }
        if (!workshop) {
          workshop = await Workshop.findOne({
            $or: [{ batchCode: input.workshopId }, { slug: input.workshopId }],
          });
        }
      } catch (err: any) {
        console.warn('[MongoDB Workshop Lookup]', err.message);
      }
    }

    if (!workshop) {
      workshop = await memoryStore.findWorkshop(input.workshopId);
    }

    if (!workshop) {
      throw ApiError.notFound('Selected workshop cohort was not found.');
    }

    // 2. Identify or Create User
    let user: any = null;
    let autoCreatedToken: string | undefined;

    if (isDBConnected()) {
      try {
        if (currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)) {
          user = await User.findById(currentUserId);
        }

        if (!user) {
          user = await User.findOne({ email });
          if (!user) {
            user = await User.create({
              name: input.fullName,
              email,
              phone: {
                countryCode: input.phoneCountryCode,
                number: input.phoneNumber,
              },
              role: 'learner',
              userCategory: input.userCategory,
              experienceLevel: input.experienceLevel,
              marketingConsent: input.marketingConsent || false,
            });

            autoCreatedToken = signToken({
              userId: user._id.toString(),
              email: user.email,
              role: user.role,
            });
          }
        }
      } catch (err: any) {
        console.warn('[MongoDB User Creation in Enrollment]', err.message);
      }
    }

    // Fallback user in memory
    if (!user) {
      if (currentUserId) {
        user = await memoryStore.findUserById(currentUserId);
      }
      if (!user) {
        user = await memoryStore.findUserByEmail(email);
      }
      if (!user) {
        user = await memoryStore.createUser({
          name: input.fullName,
          email,
          phone: {
            countryCode: input.phoneCountryCode,
            number: input.phoneNumber,
          },
          role: 'learner',
          userCategory: input.userCategory,
          experienceLevel: input.experienceLevel,
          marketingConsent: input.marketingConsent,
        });

        autoCreatedToken = signToken({
          userId: user._id,
          email: user.email,
          role: user.role,
        });
      }
    }

    // 3. Pricing & Reservation
    const isFree = Boolean(workshop.price?.isFree || workshop.price?.basePrice === 0);
    const basePrice = workshop.price?.basePrice || 1999;
    const taxPercentage = workshop.price?.taxPercentage || 18;
    const taxAmount = isFree ? 0 : Math.round(basePrice * (taxPercentage / 100));
    const totalAmount = isFree ? 0 : basePrice + taxAmount;
    const currency = workshop.price?.currency || 'INR';

    // 4. Create Enrollment
    let enrollment: any = null;

    if (isDBConnected() && user._id && mongoose.Types.ObjectId.isValid(user._id.toString()) && workshop._id && mongoose.Types.ObjectId.isValid(workshop._id.toString())) {
      try {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const enrollmentId = `ENR-${new Date().getFullYear()}-${randomSuffix}`;
        const reservedUntil = isFree ? undefined : new Date(Date.now() + 15 * 60 * 1000);

        enrollment = await Enrollment.create({
          enrollmentId,
          userId: user._id,
          workshopId: workshop._id,
          status: isFree ? 'confirmed' : 'pending',
          paymentStatus: isFree ? 'free' : 'pending',
          reservedUntil,
          attendeeDetails: {
            fullName: input.fullName,
            email,
            phone: `${input.phoneCountryCode} ${input.phoneNumber}`,
            userCategory: input.userCategory,
            experienceLevel: input.experienceLevel,
          },
          utm: input.utm,
        });

        if (!isFree) {
          await Payment.create({
            userId: user._id,
            enrollmentId: enrollment._id,
            amount: totalAmount,
            currency,
            provider: 'razorpay',
            status: 'pending',
            taxAmount,
          });
        }
      } catch (dbErr: any) {
        console.warn('[MongoDB Enrollment Creation Fallback]', dbErr.message);
      }
    }

    if (!enrollment) {
      enrollment = await memoryStore.createEnrollment({
        userId: user._id.toString(),
        workshopId: workshop._id.toString(),
        attendeeDetails: {
          fullName: input.fullName,
          email,
          phone: `${input.phoneCountryCode} ${input.phoneNumber}`,
        },
        paymentStatus: isFree ? 'completed' : 'pending',
      });
    }

    return {
      enrollment: {
        _id: enrollment._id.toString(),
        enrollmentId: enrollment.enrollmentId,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        reservedUntil: enrollment.reservedUntil,
        attendeeDetails: enrollment.attendeeDetails,
        enrolledAt: enrollment.enrolledAt || enrollment.createdAt || new Date(),
      },
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      workshop: {
        _id: workshop._id.toString(),
        title: workshop.title,
        batchCode: workshop.batchCode,
        startDate: workshop.startDate,
        endDate: workshop.endDate,
        timings: workshop.timings,
        timezone: workshop.timezone,
        availableSeats: workshop.availableSeats || 24,
      },
      token: autoCreatedToken,
      paymentRequired: !isFree,
      orderSummary: {
        basePrice,
        taxAmount,
        totalAmount,
        currency,
      },
    };
  }

  static async getLearnerEnrollments(userId: string): Promise<any[]> {
    if (isDBConnected() && mongoose.Types.ObjectId.isValid(userId)) {
      try {
        const enrollments = await Enrollment.find({ userId })
          .populate('workshopId', 'title batchCode startDate endDate timings timezone instructor price')
          .sort({ createdAt: -1 });
        if (enrollments && enrollments.length > 0) {
          return enrollments;
        }
      } catch (err: any) {
        console.warn('[MongoDB getLearnerEnrollments]', err.message);
      }
    }

    return memoryStore.getEnrollmentsByUserId(userId);
  }

  static async getAllEnrollments(): Promise<any[]> {
    if (isDBConnected()) {
      try {
        const enrollments = await Enrollment.find()
          .populate('userId', 'name email phone role')
          .populate('workshopId', 'title batchCode startDate capacity enrolledCount')
          .sort({ createdAt: -1 });
        if (enrollments && enrollments.length > 0) {
          return enrollments;
        }
      } catch (err: any) {
        console.warn('[MongoDB getAllEnrollments]', err.message);
      }
    }

    return memoryStore.getAllEnrollments();
  }
}
