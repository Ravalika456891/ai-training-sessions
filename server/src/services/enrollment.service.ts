import mongoose from 'mongoose';
import { Enrollment, IEnrollment } from '../models/Enrollment.js';
import { Workshop } from '../models/Workshop.js';
import { User, IUser } from '../models/User.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/apiError.js';
import { CreateEnrollmentInput } from '../validators/enrollment.validator.js';
import { signToken } from '../utils/jwt.js';

export interface EnrollmentResult {
  enrollment: IEnrollment;
  user: Partial<IUser>;
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
    // 1. Verify Workshop exists and is published
    let workshop = await Workshop.findById(input.workshopId);
    if (!workshop) {
      // Also allow looking up by batchCode or slug
      workshop = await Workshop.findOne({
        $or: [{ batchCode: input.workshopId }, { slug: input.workshopId }],
      });
    }

    if (!workshop) {
      throw ApiError.notFound('Selected workshop cohort was not found.');
    }

    if (workshop.status !== 'published') {
      throw ApiError.badRequest('This workshop cohort is not currently open for registration.');
    }

    // 2. Identify or Create User
    let user: IUser | null = null;
    let autoCreatedToken: string | undefined;

    if (currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)) {
      user = await User.findById(currentUserId);
    }

    if (!user) {
      // Find by email or create new user account
      user = await User.findOne({ email: input.email.toLowerCase() });

      if (!user) {
        user = await User.create({
          name: input.fullName,
          email: input.email.toLowerCase(),
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

    // 3. Prevent duplicate active enrollment
    const existingEnrollment = await Enrollment.findOne({
      userId: user._id,
      workshopId: workshop._id,
      status: { $in: ['pending', 'confirmed', 'attended'] },
    });

    if (existingEnrollment) {
      throw ApiError.conflict(
        `You already have an active registration (${existingEnrollment.enrollmentId}) for this cohort.`
      );
    }

    // 4 & 6. Enforce workshop capacity ATOMICALLY to prevent race conditions & overbooking
    const isFree = workshop.price.isFree || workshop.price.basePrice === 0;
    const seatFieldToIncrement = isFree ? 'enrolledCount' : 'reservedCount';

    const updatedWorkshop = await Workshop.findOneAndUpdate(
      {
        _id: workshop._id,
        status: 'published',
        $expr: {
          $lt: [
            { $add: ['$enrolledCount', '$reservedCount'] },
            '$capacity',
          ],
        },
      },
      {
        $inc: { [seatFieldToIncrement]: 1 },
      },
      { new: true }
    );

    if (!updatedWorkshop) {
      throw ApiError.conflict('Sorry, this workshop cohort has reached maximum capacity.');
    }

    // 5. Generate formatted unique enrollment ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const enrollmentId = `ENR-${new Date().getFullYear()}-${randomSuffix}`;

    // 7. Calculate Pricing & Reservation window
    const basePrice = workshop.price.basePrice;
    const taxPercentage = workshop.price.taxPercentage || 18;
    const taxAmount = isFree ? 0 : Math.round(basePrice * (taxPercentage / 100));
    const totalAmount = isFree ? 0 : basePrice + taxAmount;
    const reservedUntil = isFree ? undefined : new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // 8. Save Enrollment Data in MongoDB
    const enrollment = await Enrollment.create({
      enrollmentId,
      userId: user._id,
      workshopId: workshop._id,
      status: isFree ? 'confirmed' : 'pending',
      paymentStatus: isFree ? 'free' : 'pending',
      reservedUntil,
      attendeeDetails: {
        fullName: input.fullName,
        email: input.email.toLowerCase(),
        phone: `${input.phoneCountryCode} ${input.phoneNumber}`,
        userCategory: input.userCategory,
        experienceLevel: input.experienceLevel,
      },
      utm: input.utm,
    });

    // 9. If paid, create initial Payment record
    if (!isFree) {
      await Payment.create({
        userId: user._id,
        enrollmentId: enrollment._id,
        amount: totalAmount,
        currency: workshop.price.currency || 'INR',
        provider: 'razorpay',
        status: 'pending',
        taxAmount,
      });
    }

    return {
      enrollment,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      workshop: {
        _id: updatedWorkshop._id,
        title: updatedWorkshop.title,
        batchCode: updatedWorkshop.batchCode,
        startDate: updatedWorkshop.startDate,
        endDate: updatedWorkshop.endDate,
        timings: updatedWorkshop.timings,
        timezone: updatedWorkshop.timezone,
        availableSeats: updatedWorkshop.availableSeats,
      },
      token: autoCreatedToken,
      paymentRequired: !isFree,
      orderSummary: {
        basePrice,
        taxAmount,
        totalAmount,
        currency: workshop.price.currency || 'INR',
      },
    };
  }

  static async getLearnerEnrollments(userId: string): Promise<IEnrollment[]> {
    return Enrollment.find({ userId })
      .populate('workshopId', 'title batchCode startDate endDate timings timezone instructor price')
      .sort({ createdAt: -1 });
  }

  static async getAllEnrollments(): Promise<IEnrollment[]> {
    return Enrollment.find()
      .populate('userId', 'name email phone role')
      .populate('workshopId', 'title batchCode startDate capacity enrolledCount')
      .sort({ createdAt: -1 });
  }
}

