import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

export interface IMemoryUser {
  _id: string;
  name: string;
  email: string;
  passwordHash?: string;
  phone?: { countryCode: string; number: string };
  googleId?: string;
  avatarUrl?: string;
  role: 'learner' | 'instructor' | 'admin' | 'support';
  userCategory?: 'student' | 'working_professional' | 'founder' | 'creator' | 'other';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  marketingConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IMemoryWorkshop {
  _id: string;
  title: string;
  slug: string;
  batchCode: string;
  description: string;
  instructor: {
    name: string;
    role: string;
    bio: string;
    avatarUrl: string;
  };
  startDate: Date;
  endDate: Date;
  timings: string;
  timezone: string;
  capacity: number;
  enrolledCount: number;
  reservedCount: number;
  availableSeats: number;
  price: {
    basePrice: number;
    currency: string;
    taxPercentage: number;
    isFree: boolean;
  };
  status: 'draft' | 'published' | 'completed' | 'cancelled';
}

export interface IMemoryEnrollment {
  _id: string;
  enrollmentId: string;
  user: string;
  workshop: string;
  status: 'reserved' | 'confirmed' | 'cancelled' | 'waitlisted';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  reservedUntil?: Date;
  attendeeDetails: {
    fullName: string;
    email: string;
    phone: string;
  };
  day1Attended: boolean;
  day2Attended: boolean;
  enrolledAt: Date;
}

class MemoryStoreService {
  private users: Map<string, IMemoryUser> = new Map();
  private workshops: Map<string, IMemoryWorkshop> = new Map();
  private enrollments: Map<string, IMemoryEnrollment> = new Map();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Seed Default Admin User
    const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
    const adminId = 'mem_user_admin_001';
    this.users.set(adminId, {
      _id: adminId,
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: 'admin',
      userCategory: 'working_professional',
      experienceLevel: 'advanced',
      phone: { countryCode: '+91', number: '9999999999' },
      marketingConsent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(pwd: string) {
        return bcrypt.compare(pwd, this.passwordHash || '');
      },
    });

    // 2. Seed Default Cohort Workshops
    const defaultWorkshops: IMemoryWorkshop[] = [
      {
        _id: 'batch-nov-14',
        title: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
        slug: 'ai-launchpad-nov-14-2026',
        batchCode: 'AILP-2026-NOV-14',
        description:
          'Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.',
        instructor: {
          name: 'Vikram Malhotra',
          role: 'Staff AI Engineer & Former ML Lead',
          bio: 'Over 12 years building production software and 4 years leading enterprise LLM integrations. Mentored over 1,500 professionals.',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
        startDate: new Date('2026-11-14T10:00:00+05:30'),
        endDate: new Date('2026-11-15T15:00:00+05:30'),
        timings: '10:00 AM – 3:00 PM IST',
        timezone: 'Asia/Kolkata (IST)',
        capacity: 60,
        enrolledCount: 36,
        reservedCount: 0,
        availableSeats: 24,
        price: {
          basePrice: 1999,
          currency: 'INR',
          taxPercentage: 18,
          isFree: false,
        },
        status: 'published',
      },
      {
        _id: 'batch-nov-28',
        title: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
        slug: 'ai-launchpad-nov-28-2026',
        batchCode: 'AILP-2026-NOV-28',
        description:
          'Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.',
        instructor: {
          name: 'Ananya Sharma',
          role: 'AI Product Architect & Startup Advisor',
          bio: 'Specialist in agentic AI architectures and LLM evals. Former AI Lead at hyper-growth tech startups.',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        },
        startDate: new Date('2026-11-28T10:00:00+05:30'),
        endDate: new Date('2026-11-29T15:00:00+05:30'),
        timings: '10:00 AM – 3:00 PM IST',
        timezone: 'Asia/Kolkata (IST)',
        capacity: 60,
        enrolledCount: 12,
        reservedCount: 0,
        availableSeats: 48,
        price: {
          basePrice: 1999,
          currency: 'INR',
          taxPercentage: 18,
          isFree: false,
        },
        status: 'published',
      },
      {
        _id: 'batch-dec-12',
        title: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
        slug: 'ai-launchpad-dec-12-2026',
        batchCode: 'AILP-2026-DEC-12',
        description:
          'Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.',
        instructor: {
          name: 'Vikram Malhotra',
          role: 'Staff AI Engineer & Former ML Lead',
          bio: 'Over 12 years building production software and 4 years leading enterprise LLM integrations.',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
        startDate: new Date('2026-12-12T10:00:00+05:30'),
        endDate: new Date('2026-12-13T15:00:00+05:30'),
        timings: '10:00 AM – 3:00 PM IST',
        timezone: 'Asia/Kolkata (IST)',
        capacity: 60,
        enrolledCount: 0,
        reservedCount: 0,
        availableSeats: 60,
        price: {
          basePrice: 1999,
          currency: 'INR',
          taxPercentage: 18,
          isFree: false,
        },
        status: 'published',
      },
    ];

    for (const w of defaultWorkshops) {
      this.workshops.set(w._id, w);
    }
  }

  // --- User Operations ---
  async findUserByEmail(email: string): Promise<IMemoryUser | null> {
    await this.init();
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email === normalized) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<IMemoryUser | null> {
    await this.init();
    return this.users.get(id) || null;
  }

  async createUser(userData: {
    name: string;
    email: string;
    password?: string;
    phone?: { countryCode: string; number: string };
    googleId?: string;
    avatarUrl?: string;
    userCategory?: any;
    experienceLevel?: any;
    marketingConsent?: boolean;
    role?: any;
  }): Promise<IMemoryUser> {
    await this.init();
    let passwordHash: string | undefined;
    if (userData.password) {
      passwordHash = await bcrypt.hash(userData.password, 10);
    }

    const _id = 'mem_user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newUser: IMemoryUser = {
      _id,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      passwordHash,
      phone: userData.phone || { countryCode: '+91', number: '' },
      googleId: userData.googleId,
      avatarUrl: userData.avatarUrl,
      role: userData.role || 'learner',
      userCategory: userData.userCategory || 'working_professional',
      experienceLevel: userData.experienceLevel || 'beginner',
      marketingConsent: userData.marketingConsent || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(pwd: string) {
        if (!this.passwordHash) return false;
        return bcrypt.compare(pwd, this.passwordHash);
      },
    };

    this.users.set(_id, newUser);
    return newUser;
  }

  // --- Workshop Operations ---
  async getPublishedWorkshops(): Promise<IMemoryWorkshop[]> {
    await this.init();
    return Array.from(this.workshops.values()).filter((w) => w.status === 'published');
  }

  async findWorkshop(idOrCode: string): Promise<IMemoryWorkshop | null> {
    await this.init();
    if (!idOrCode) return null;

    // Check direct ID match
    if (this.workshops.has(idOrCode)) {
      return this.workshops.get(idOrCode)!;
    }

    // Check batchCode or slug match
    for (const w of this.workshops.values()) {
      if (
        w.batchCode === idOrCode ||
        w.slug === idOrCode ||
        w._id.toLowerCase() === idOrCode.toLowerCase()
      ) {
        return w;
      }
    }

    // If ID is like AILP-2026-B1 or batch-nov-14, match partial
    for (const w of this.workshops.values()) {
      if (idOrCode.includes('nov-14') || idOrCode.includes('B1')) {
        return w;
      }
    }

    // Return first published workshop as fallback
    const published = await this.getPublishedWorkshops();
    return published[0] || null;
  }

  // --- Enrollment Operations ---
  async createEnrollment(data: {
    userId: string;
    workshopId: string;
    attendeeDetails: { fullName: string; email: string; phone: string };
    paymentStatus?: 'pending' | 'completed';
  }): Promise<IMemoryEnrollment> {
    await this.init();
    const num = Math.floor(1000 + Math.random() * 9000);
    const enrollmentId = `AILP-${new Date().getFullYear()}-${num}`;
    const _id = 'mem_enr_' + Date.now();

    const enrollment: IMemoryEnrollment = {
      _id,
      enrollmentId,
      user: data.userId,
      workshop: data.workshopId,
      status: 'reserved',
      paymentStatus: data.paymentStatus || 'pending',
      reservedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      attendeeDetails: data.attendeeDetails,
      day1Attended: false,
      day2Attended: false,
      enrolledAt: new Date(),
    };

    this.enrollments.set(_id, enrollment);

    // Update workshop available seats
    const workshop = this.workshops.get(data.workshopId);
    if (workshop && workshop.availableSeats > 0) {
      workshop.availableSeats -= 1;
      workshop.reservedCount += 1;
    }

    return enrollment;
  }

  async getEnrollmentsByUserId(userId: string): Promise<IMemoryEnrollment[]> {
    await this.init();
    return Array.from(this.enrollments.values()).filter((e) => e.user === userId);
  }

  async getAllEnrollments(): Promise<IMemoryEnrollment[]> {
    await this.init();
    return Array.from(this.enrollments.values());
  }

  async findEnrollmentById(enrollmentId: string): Promise<IMemoryEnrollment | null> {
    await this.init();
    for (const e of this.enrollments.values()) {
      if (e._id === enrollmentId || e.enrollmentId === enrollmentId) {
        return e;
      }
    }
    return null;
  }
}

export const memoryStore = new MemoryStoreService();

