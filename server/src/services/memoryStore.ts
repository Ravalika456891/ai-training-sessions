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
  accountStatus?: 'active' | 'suspended' | 'deactivated';
  bio?: string;
  expertise?: string[];
  availabilityStatus?: 'available' | 'busy' | 'unavailable';
  userCategory?: 'student' | 'working_professional' | 'founder' | 'creator' | 'other';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  marketingConsent: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date; 
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
  status: 'draft' | 'published' | 'archived' | 'completed' | 'cancelled';
  thumbnailUrl?: string;
  registrationDeadline?: Date;
  liveSessionUrl?: string;
  meetingPasscode?: string;
}

export interface IMemoryRegistration {
  _id: string;
  name: string;
  email: string;
  phone: string;
  batchId: string;
  registrationStatus: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'waived';
  createdAt: Date;
  updatedAt: Date;
}

export interface IMemoryEnrollment {
  _id: string;
  enrollmentId: string;
  user: string;
  workshop: string;
  status: 'pending_payment' | 'reserved' | 'confirmed' | 'cancelled' | 'expired' | 'waitlisted' | 'completed';
  paymentStatus: 'created' | 'authorized' | 'captured' | 'pending' | 'completed' | 'failed' | 'refunded' | 'free';
  reservedUntil?: Date;
  confirmedAt?: Date;
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
  private registrations: Map<string, IMemoryRegistration> = new Map();
  private sessions: Map<string, any> = new Map();
  private resources: Map<string, any> = new Map();
  private certificates: Map<string, any> = new Map();
  private submissions: Map<string, any> = new Map();
  private assignments: Map<string, any> = new Map();
  private auditLogs: any[] = [];
  private settings: any = {
    key: 'global_settings',
    branding: {
      siteName: 'AI Launchpad',
      tagline: '2-Day Hands-On AI Bootcamp',
      supportEmail: 'admissions@ailaunchpad.edu',
      supportPhone: '+91 98765 43210',
      primaryColor: '#081e4a',
    },
    registration: {
      allowPublicRegistration: true,
      requireEmailVerification: false,
      maxSeatsPerBatch: 60,
      reservationHoldMinutes: 15,
      waitlistEnabled: true,
    },
    workshopDefaults: {
      defaultBasePrice: 1999,
      defaultCurrency: 'INR',
      defaultTaxPercentage: 18,
      defaultTimezone: 'Asia/Kolkata (IST)',
      defaultTimings: '10:00 AM – 3:00 PM IST',
    },
    emailTemplates: {
      registrationConfirmationSubject: 'Welcome to AI Launchpad — Your Cohort Registration Details',
      paymentReceiptSubject: 'Confirmed: Your AI Launchpad Bootcamp Seat & Payment Receipt',
      certificateIssuedSubject: 'Congratulations! Your Official AI Launchpad Certificate is Ready',
      reminderHoursBeforeSession: 24,
    },
    instructorPermissions: {
      canMarkAttendance: true,
      canReviewSubmissions: true,
      canUploadMaterials: true,
      canViewStudentEmails: true,
    },
    notifications: {
      notifyAdminOnNewEnrollment: true,
      notifyAdminOnPaymentFailure: true,
      notifyStudentOnCertificateIssue: true,
    },
    updatedAt: new Date(),
  };
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.runInit();
  }

  private async init() {
    if (!this.initPromise) {
      this.initPromise = this.runInit();
    }
    await this.initPromise;
  }

  private async runInit() {

    // 1. Seed Default Admin Users (supports both .env and fallback credentials)
    const adminPasswordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
    const fallbackAdminHash = await bcrypt.hash('AdminPassword123!', 10);
    const eduAdminHash = await bcrypt.hash('AdminLaunchpad2026!', 10);

    const compareAdminPwd = async (pwd: string, primaryHash?: string) => {
      if (primaryHash && (await bcrypt.compare(pwd, primaryHash))) return true;
      if (await bcrypt.compare(pwd, fallbackAdminHash)) return true;
      if (await bcrypt.compare(pwd, eduAdminHash)) return true;
      return false;
    };

    const adminEmails = Array.from(
      new Set([env.ADMIN_EMAIL.toLowerCase(), 'admin@ailaunchpad.edu', 'admin@ailaunchpad.com'])
    );
    adminEmails.forEach((admEmail, idx) => {
      const adminId = `mem_user_admin_00${idx + 1}`;
      this.users.set(adminId, {
        _id: adminId,
        name: env.ADMIN_NAME || 'System Administrator',
        email: admEmail,
        passwordHash: adminPasswordHash,
        role: 'admin',
        userCategory: 'working_professional',
        experienceLevel: 'advanced',
        phone: { countryCode: '+91', number: '9999999999' },
        marketingConsent: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        async comparePassword(pwd: string) {
          return compareAdminPwd(pwd, this.passwordHash);
        },
      });
    });

    // 2. Seed Default Cohort Workshops (All available sessions)
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
    ];

    for (const w of defaultWorkshops) {
      this.workshops.set(w._id, w);
      const day1Start = new Date(w.startDate);
      const day1End = new Date(day1Start.getTime() + 5 * 60 * 60 * 1000);
      const day2Start = new Date(w.endDate);
      day2Start.setHours(day1Start.getHours(), day1Start.getMinutes(), 0, 0);
      const day2End = new Date(day2Start.getTime() + 5 * 60 * 60 * 1000);

      this.sessions.set(`${w._id}_day1`, {
        _id: `${w._id}_day1`,
        workshopId: w._id,
        batchId: w._id,
        batchCode: w.batchCode,
        dayNumber: 1,
        title: 'Day 1: LLM Foundations, Prompt Architecture & Custom Assistants',
        description: 'Interactive live training on LLM architectures, prompt engineering, and custom AI assistants.',
        sessionDate: day1Start,
        startAt: day1Start,
        endAt: day1End,
        durationMinutes: 300,
        startTime: '10:00 AM',
        endTime: '3:00 PM',
        timezone: 'Asia/Kolkata',
        instructorName: w.instructor.name,
        classType: 'live',
        meetingProvider: 'google_meet',
        liveSessionUrl: `https://meet.google.com/ailp-${w.batchCode.toLowerCase()}-day1`,
        meetingPasscode: 'AILP2026',
        visibility: 'enrolled_only',
        capacity: w.capacity,
        maxAttendees: w.capacity,
        registrationDeadline: new Date(day1Start.getTime() - 24 * 60 * 60 * 1000),
        status: 'scheduled',
        changeHistory: [
          {
            action: 'CREATED',
            summary: 'Initial cohort Day 1 live session scheduled',
            actorEmail: env.ADMIN_EMAIL,
            timestamp: new Date(),
          },
        ],
      });
      this.sessions.set(`${w._id}_day2`, {
        _id: `${w._id}_day2`,
        workshopId: w._id,
        batchId: w._id,
        batchCode: w.batchCode,
        dayNumber: 2,
        title: 'Day 2: Multi-Step AI Workflows, React Prototypes & Production Ship',
        description: 'Hands-on lab building multi-step AI workflows, RAG pipelines, and full-stack web prototypes.',
        sessionDate: day2Start,
        startAt: day2Start,
        endAt: day2End,
        durationMinutes: 300,
        startTime: '10:00 AM',
        endTime: '3:00 PM',
        timezone: 'Asia/Kolkata',
        instructorName: w.instructor.name,
        classType: 'live',
        meetingProvider: 'google_meet',
        liveSessionUrl: `https://meet.google.com/ailp-${w.batchCode.toLowerCase()}-day2`,
        meetingPasscode: 'AILP2026',
        visibility: 'enrolled_only',
        capacity: w.capacity,
        maxAttendees: w.capacity,
        registrationDeadline: new Date(day1Start.getTime() - 24 * 60 * 60 * 1000),
        status: 'scheduled',
        changeHistory: [
          {
            action: 'CREATED',
            summary: 'Initial cohort Day 2 live session scheduled',
            actorEmail: env.ADMIN_EMAIL,
            timestamp: new Date(),
          },
        ],
      });
    }

    // Seed Default Instructors
    const inst1Id = 'mem_user_inst_001';
    this.users.set(inst1Id, {
      _id: inst1Id,
      name: 'Vikram Malhotra',
      email: 'vikram@ailaunchpad.edu',
      passwordHash: adminPasswordHash,
      role: 'instructor',
      accountStatus: 'active',
      bio: 'Over 12 years building production software and 4 years leading enterprise LLM integrations. Mentored over 1,500 professionals.',
      expertise: ['LLM Architecture', 'RAG Systems', 'Prompt Engineering', 'TypeScript'],
      availabilityStatus: 'available',
      phone: { countryCode: '+91', number: '9888888881' },
      marketingConsent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(pwd: string) {
        return bcrypt.compare(pwd, this.passwordHash || '');
      },
    });

    const inst2Id = 'mem_user_inst_002';
    this.users.set(inst2Id, {
      _id: inst2Id,
      name: 'Ananya Sharma',
      email: 'ananya@ailaunchpad.edu',
      passwordHash: adminPasswordHash,
      role: 'instructor',
      accountStatus: 'active',
      bio: 'Specialist in agentic AI architectures and LLM evals. Former AI Lead at hyper-growth tech startups.',
      expertise: ['AI Agents', 'n8n & Make Workflows', 'LLM Evals', 'Full-Stack AI'],
      availabilityStatus: 'available',
      phone: { countryCode: '+91', number: '9888888882' },
      marketingConsent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(pwd: string) {
        return bcrypt.compare(pwd, this.passwordHash || '');
      },
    });

    // Seed Default Learning Resources
    const defaultResources = [
      {
        _id: 'res_001',
        title: 'Module 1 & 2: Reusable 10-Prompt Enterprise Library',
        category: 'prompt_template',
        description: 'Battle-tested system prompt templates for GPT-4o, Claude 3.5 Sonnet, and Gemini 2.0.',
        url: 'https://ai-training-sessions-zeta.vercel.app/#curriculum',
        workshopBatchCode: 'ALL',
        accessLevel: 'enrolled_only',
        isPublished: true,
        createdAt: new Date(),
      },
      {
        _id: 'res_002',
        title: 'Module 3: Custom Assistant Grounding & RAG PDF Guide',
        category: 'pdf',
        description: 'Step-by-step architecture playbook for building hallucination-free enterprise AI assistants.',
        url: 'https://ai-training-sessions-zeta.vercel.app/#curriculum',
        workshopBatchCode: 'ALL',
        accessLevel: 'enrolled_only',
        isPublished: true,
        createdAt: new Date(),
      },
      {
        _id: 'res_003',
        title: 'Module 5: React + Tailwind AI Prototype Starter Repository',
        category: 'code_repo',
        description: 'Production-ready full-stack starter kit with streaming LLM responses and tool calling.',
        url: 'https://github.com/example/ai-prototype-starter',
        workshopBatchCode: 'ALL',
        accessLevel: 'enrolled_only',
        isPublished: true,
        createdAt: new Date(),
      },
      {
        _id: 'res_004',
        title: 'Day 2 Capstone: Production AI Workflow & App Deliverable',
        category: 'assignment',
        description: 'Build and deploy a working AI assistant or multi-step automation workflow and submit your repository URL.',
        url: 'https://ai-training-sessions-zeta.vercel.app/dashboard/assignments',
        workshopBatchCode: 'ALL',
        accessLevel: 'enrolled_only',
        isPublished: true,
        createdAt: new Date(),
      },
    ];
    for (const r of defaultResources) {
      this.resources.set(r._id, r);
    }

    const defaultAssignments = [
      {
        _id: 'assign_day1',
        title: 'Day 1 Deliverable: Custom Grounded AI Assistant & Prompt Library',
        description:
          'Configure a domain-specific AI assistant with system prompt instructions, structured JSON output schema, and knowledge base grounding.',
        dayNumber: 1,
        workshopBatchCode: 'ALL',
        isRequiredForCertificate: true,
        createdAt: new Date(),
      },
      {
        _id: 'assign_day2',
        title: 'Day 2 Capstone: Multi-Step AI Workflow & Functional Web Prototype',
        description:
          'Build and deploy a working multi-step AI automation or full-stack web prototype and submit your repository and live demo links.',
        dayNumber: 2,
        workshopBatchCode: 'ALL',
        isRequiredForCertificate: true,
        createdAt: new Date(),
      },
    ];
    for (const a of defaultAssignments) {
      this.assignments.set(a._id, a);
    }

    // Seed Default Student / User Accounts (Enrolled Student & Registered User)
    const studentPwdHash = await bcrypt.hash('StudentLaunchpad2026!', 10);
    const simpleStudentHash = await bcrypt.hash('Student123!', 10);
    const compareStudentPwd = async (pwd: string) => {
      if (await bcrypt.compare(pwd, studentPwdHash)) return true;
      if (await bcrypt.compare(pwd, simpleStudentHash)) return true;
      if (await bcrypt.compare(pwd, adminPasswordHash)) return true;
      return false;
    };

    const enrolledStudentId = 'mem_user_student_001';
    this.users.set(enrolledStudentId, {
      _id: enrolledStudentId,
      name: 'Aarav Mehta',
      email: 'student@ailaunchpad.edu',
      passwordHash: studentPwdHash,
      role: 'learner',
      accountStatus: 'active',
      userCategory: 'working_professional',
      experienceLevel: 'intermediate',
      phone: { countryCode: '+91', number: '9876543210' },
      marketingConsent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(pwd: string) {
        return compareStudentPwd(pwd);
      },
    });

    const enrolledStudentAltId = 'mem_user_student_002';
    this.users.set(enrolledStudentAltId, {
      _id: enrolledStudentAltId,
      name: 'Aarav Mehta',
      email: 'student@example.com',
      passwordHash: simpleStudentHash,
      role: 'learner',
      accountStatus: 'active',
      userCategory: 'working_professional',
      experienceLevel: 'intermediate',
      phone: { countryCode: '+91', number: '9876543210' },
      marketingConsent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(pwd: string) {
        return compareStudentPwd(pwd);
      },
    });

    // Confirmed Enrollment for the default Enrolled Student
    this.enrollments.set('enr_default_student_001', {
      _id: 'enr_default_student_001',
      enrollmentId: 'AILP-ENR-1001',
      user: enrolledStudentId,
      workshop: 'batch-nov-14',
      status: 'confirmed',
      paymentStatus: 'captured',
      confirmedAt: new Date(),
      attendeeDetails: {
        fullName: 'Aarav Mehta',
        email: 'student@ailaunchpad.edu',
        phone: '9876543210',
      },
      day1Attended: true,
      day2Attended: true,
      enrolledAt: new Date(),
    });

    this.enrollments.set('enr_default_student_002', {
      _id: 'enr_default_student_002',
      enrollmentId: 'AILP-ENR-1002',
      user: enrolledStudentAltId,
      workshop: 'batch-nov-14',
      status: 'confirmed',
      paymentStatus: 'captured',
      confirmedAt: new Date(),
      attendeeDetails: {
        fullName: 'Aarav Mehta',
        email: 'student@example.com',
        phone: '9876543210',
      },
      day1Attended: true,
      day2Attended: true,
      enrolledAt: new Date(),
    });

    // Registered (Unpaid Preview) User Account
    const registeredUserId = 'mem_user_student_003';
    this.users.set(registeredUserId, {
      _id: registeredUserId,
      name: 'Priya Nair',
      email: 'user@ailaunchpad.edu',
      passwordHash: studentPwdHash,
      role: 'learner',
      accountStatus: 'active',
      userCategory: 'student',
      experienceLevel: 'beginner',
      phone: { countryCode: '+91', number: '9876501234' },
      marketingConsent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(pwd: string) {
        return compareStudentPwd(pwd);
      },
    });

    const ramyaPwdHash = await bcrypt.hash('mnopqrs123', 10);
    const ramyaUserId = 'mem_user_student_004';
    this.users.set(ramyaUserId, {
      _id: ramyaUserId,
      name: 'Ramya',
      email: 'ramya@gmail.com',
      passwordHash: ramyaPwdHash,
      role: 'learner',
      accountStatus: 'active',
      userCategory: 'student',
      experienceLevel: 'beginner',
      phone: { countryCode: '+91', number: '9876543210' },
      marketingConsent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(pwd: string) {
        if (!this.passwordHash) return false;
        return bcrypt.compare(pwd, this.passwordHash);
      },
    });
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

  async findUserByResetToken(hashedToken: string): Promise<IMemoryUser | null> {
    await this.init();
    const now = new Date();
    for (const user of this.users.values()) {
      if (
        user.resetPasswordToken === hashedToken &&
        user.resetPasswordExpires &&
        new Date(user.resetPasswordExpires) > now
      ) {
        return user;
      }
    }
    return null;
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

  async restoreUserWithHash(userData: {
    _id?: string;
    name: string;
    email: string;
    passwordHash?: string;
    phone?: { countryCode: string; number: string };
    userCategory?: any;
    experienceLevel?: any;
  }): Promise<IMemoryUser> {
    await this.init();
    const existing = await this.findUserByEmail(userData.email);
    if (existing) {
      if (userData.passwordHash && !existing.passwordHash) {
        existing.passwordHash = userData.passwordHash;
      }
      return existing;
    }

    const _id = userData._id || 'mem_user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const restoredUser: IMemoryUser = {
      _id,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      phone: userData.phone || { countryCode: '+91', number: '' },
      role: 'learner',
      userCategory: userData.userCategory || 'working_professional',
      experienceLevel: userData.experienceLevel || 'beginner',
      marketingConsent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      async comparePassword(pwd: string) {
        if (!this.passwordHash) return false;
        return bcrypt.compare(pwd, this.passwordHash);
      },
    };
    this.users.set(_id, restoredUser);
    return restoredUser;
  }

  // --- Workshop Operations ---
  async getPublishedWorkshops(): Promise<IMemoryWorkshop[]> {
    await this.init();
    return Array.from(this.workshops.values())
      .filter((w) => w.status === 'published')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  async findWorkshopExact(idOrCode: string): Promise<IMemoryWorkshop | null> {
    await this.init();
    if (!idOrCode) return null;
    if (this.workshops.has(idOrCode)) {
      return this.workshops.get(idOrCode)!;
    }
    const needle = idOrCode.trim().toLowerCase();
    for (const w of this.workshops.values()) {
      if (
        w.batchCode.toLowerCase() === needle ||
        w.slug.toLowerCase() === needle ||
        w._id.toLowerCase() === needle
      ) {
        return w;
      }
    }
    return null;
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
    paymentStatus?: 'created' | 'pending' | 'completed' | 'captured' | 'free';
  }): Promise<IMemoryEnrollment> {
    await this.init();

    // Prevent duplicate enrollments for the same (userId, workshopId)
    for (const existing of this.enrollments.values()) {
      if (
        existing.user === data.userId &&
        existing.workshop === data.workshopId &&
        existing.status !== 'cancelled' &&
        existing.status !== 'expired'
      ) {
        if (existing.status !== 'confirmed') {
          existing.reservedUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        return existing;
      }
    }

    const num = Math.floor(1000 + Math.random() * 9000);
    const enrollmentId = `AILP-${new Date().getFullYear()}-${num}`;
    const _id = 'mem_enr_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const isFreeConfirmed =
      data.paymentStatus === 'completed' ||
      data.paymentStatus === 'captured' ||
      data.paymentStatus === 'free';
    const enrollment: IMemoryEnrollment = {
      _id,
      enrollmentId,
      user: data.userId,
      workshop: data.workshopId,
      status: isFreeConfirmed ? 'confirmed' : 'pending_payment',
      paymentStatus: isFreeConfirmed ? 'free' : 'created',
      reservedUntil: isFreeConfirmed
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 15 * 60 * 1000),
      confirmedAt: isFreeConfirmed ? new Date() : undefined,
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
      if (isFreeConfirmed) {
        workshop.enrolledCount += 1;
      } else {
        workshop.reservedCount += 1;
      }
    }

    return enrollment;
  }

  async confirmEnrollmentPayment(enrollmentId: string): Promise<IMemoryEnrollment | null> {
    await this.init();
    const enr = await this.findEnrollmentById(enrollmentId);
    if (enr) {
      const wasConfirmed = enr.status === 'confirmed';
      enr.status = 'confirmed';
      enr.paymentStatus = 'captured';
      enr.confirmedAt = new Date();
      if (!wasConfirmed) {
        const ws = this.workshops.get(enr.workshop);
        if (ws) {
          ws.reservedCount = Math.max(0, ws.reservedCount - 1);
          ws.enrolledCount += 1;
        }
      }
      return enr;
    }

    // Also check registrations by ID
    for (const reg of this.registrations.values()) {
      if (reg._id === enrollmentId || `REG-${reg._id.slice(-6).toUpperCase()}` === enrollmentId || reg._id.toUpperCase() === enrollmentId) {
        reg.registrationStatus = 'confirmed';
        reg.paymentStatus = 'paid';
        reg.updatedAt = new Date();
      }
    }
    return null;
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

  async findRegistration(email: string, batchId: string): Promise<IMemoryRegistration | null> {
    await this.init();
    const normalizedEmail = email.toLowerCase().trim();
    for (const reg of this.registrations.values()) {
      if (reg.email.toLowerCase() === normalizedEmail && reg.batchId === batchId) {
        return reg;
      }
    }
    return null;
  }

  async createRegistration(data: {
    name: string;
    email: string;
    phone: string;
    batchId: string;
    registrationStatus?: 'confirmed' | 'pending' | 'cancelled';
    paymentStatus?: 'unpaid' | 'pending' | 'paid' | 'waived';
  }): Promise<IMemoryRegistration> {
    await this.init();
    const _id = 'reg_' + Date.now() + '_' + Math.floor(1000 + Math.random() * 9000);
    const registration: IMemoryRegistration = {
      _id,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      batchId: data.batchId.trim(),
      registrationStatus: data.registrationStatus || 'confirmed',
      paymentStatus: data.paymentStatus || 'unpaid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.registrations.set(_id, registration);
    return registration;
  }

  async getAllRegistrations(): Promise<IMemoryRegistration[]> {
    await this.init();
    return Array.from(this.registrations.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  // --- Admin Extended Operations ---
  async getAllUsers(): Promise<IMemoryUser[]> {
    await this.init();
    return Array.from(this.users.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateUser(id: string, updates: Partial<IMemoryUser>): Promise<IMemoryUser | null> {
    await this.init();
    const user = this.users.get(id);
    if (!user) return null;
    Object.assign(user, updates, { updatedAt: new Date() });
    this.users.set(id, user);
    return user;
  }

  async getAllWorkshops(): Promise<IMemoryWorkshop[]> {
    await this.init();
    return Array.from(this.workshops.values());
  }

  async createWorkshop(data: Partial<IMemoryWorkshop>): Promise<IMemoryWorkshop> {
    await this.init();
    const _id = 'ws_' + Date.now();
    const capacity = Number(data.capacity) || 60;
    const ws: IMemoryWorkshop = {
      _id,
      title: data.title || 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
      slug: data.slug || `ai-launchpad-${Date.now()}`,
      batchCode: (data.batchCode || `AILP-${Date.now().toString().slice(-4)}`).toUpperCase(),
      description: data.description || 'Hands-on AI Engineering Bootcamp',
      instructor: data.instructor || {
        name: 'Vikram Malhotra',
        role: 'Staff AI Engineer',
        bio: 'Enterprise AI Architect',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      },
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 86400000),
      timings: data.timings || '10:00 AM – 3:00 PM IST',
      timezone: data.timezone || 'Asia/Kolkata (IST)',
      capacity,
      enrolledCount: 0,
      reservedCount: 0,
      availableSeats: capacity,
      price: data.price || {
        basePrice: 1999,
        currency: 'INR',
        taxPercentage: 18,
        isFree: false,
      },
      status: data.status || 'published',
      thumbnailUrl: data.thumbnailUrl,
      registrationDeadline: data.registrationDeadline,
      liveSessionUrl: data.liveSessionUrl,
      meetingPasscode: data.meetingPasscode,
    };
    this.workshops.set(_id, ws);
    return ws;
  }

  async updateWorkshop(id: string, updates: Partial<IMemoryWorkshop>): Promise<IMemoryWorkshop | null> {
    await this.init();
    const ws = await this.findWorkshop(id);
    if (!ws) return null;
    Object.assign(ws, updates);
    ws.availableSeats = Math.max(0, ws.capacity - (ws.enrolledCount + ws.reservedCount));
    this.workshops.set(ws._id, ws);
    return ws;
  }

  async deleteWorkshop(id: string): Promise<boolean> {
    await this.init();
    return this.workshops.delete(id);
  }

  async getAllSessions(): Promise<any[]> {
    await this.init();
    return Array.from(this.sessions.values()).sort((a, b) => {
      const ta = new Date(a.startAt || a.sessionDate || 0).getTime();
      const tb = new Date(b.startAt || b.sessionDate || 0).getTime();
      return ta - tb;
    });
  }

  async findSessionById(id: string): Promise<any | null> {
    await this.init();
    return this.sessions.get(id) || null;
  }

  async upsertSession(data: any): Promise<any> {
    await this.init();
    const id =
      data._id ||
      `ses_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const existing = this.sessions.get(id) || {};
    const updated = {
      ...existing,
      ...data,
      _id: id,
      createdAt: existing.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(id, updated);
    return updated;
  }

  async deleteSession(id: string): Promise<boolean> {
    await this.init();
    return this.sessions.delete(id);
  }

  async getAllResources(): Promise<any[]> {
    await this.init();
    return Array.from(this.resources.values());
  }

  async createResource(data: any): Promise<any> {
    await this.init();
    const _id = 'res_' + Date.now();
    const item = {
      _id,
      ...data,
      isPublished: data.isPublished ?? true,
      accessLevel: data.accessLevel || 'enrolled_only',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.resources.set(_id, item);
    return item;
  }

  async updateResource(id: string, updates: any): Promise<any | null> {
    await this.init();
    const item = this.resources.get(id);
    if (!item) return null;
    Object.assign(item, updates, { updatedAt: new Date() });
    this.resources.set(id, item);
    return item;
  }

  async deleteResource(id: string): Promise<boolean> {
    await this.init();
    return this.resources.delete(id);
  }

  async getAllCertificates(): Promise<any[]> {
    await this.init();
    return Array.from(this.certificates.values());
  }

  async saveCertificate(cert: any): Promise<any> {
    await this.init();
    const _id = cert._id || 'cert_' + Date.now();
    const item = { ...cert, _id };
    this.certificates.set(_id.toString(), item);
    return item;
  }

  async getAllSubmissions(): Promise<any[]> {
    await this.init();
    return Array.from(this.submissions.values());
  }

  async saveSubmission(sub: any): Promise<any> {
    await this.init();
    const _id = sub._id || 'sub_' + Date.now();
    const item = {
      ...sub,
      _id,
      status: sub.status || 'submitted',
      createdAt: sub.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.submissions.set(_id.toString(), item);
    return item;
  }

  async getAllAssignments(): Promise<any[]> {
    await this.init();
    return Array.from(this.assignments.values());
  }

  async createAuditLog(entry: any): Promise<any> {
    await this.init();
    const log = {
      _id: 'audit_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      ...entry,
      createdAt: new Date(),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  async getAuditLogs(limit = 50): Promise<any[]> {
    await this.init();
    return this.auditLogs.slice(0, limit);
  }

  async getSettings(): Promise<any> {
    await this.init();
    return this.settings;
  }

  async updateSettings(updates: any, updatedBy?: string): Promise<any> {
    await this.init();
    this.settings = {
      ...this.settings,
      branding: { ...this.settings.branding, ...(updates.branding || {}) },
      registration: { ...this.settings.registration, ...(updates.registration || {}) },
      workshopDefaults: { ...this.settings.workshopDefaults, ...(updates.workshopDefaults || {}) },
      emailTemplates: { ...this.settings.emailTemplates, ...(updates.emailTemplates || {}) },
      instructorPermissions: {
        ...this.settings.instructorPermissions,
        ...(updates.instructorPermissions || {}),
      },
      notifications: { ...this.settings.notifications, ...(updates.notifications || {}) },
      updatedBy,
      updatedAt: new Date(),
    };
    return this.settings;
  }
}

export const memoryStore = new MemoryStoreService();

