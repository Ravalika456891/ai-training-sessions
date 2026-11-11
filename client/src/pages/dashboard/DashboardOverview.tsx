import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Video,
  BookOpen,
  ClipboardCheck,
  Award,
  TrendingUp,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  CreditCard,
  User,
  Users,
  ShieldCheck,
  Loader2,
  ExternalLink,
  FileText,
  Code2,
  Cpu,
  Presentation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from './DashboardLayout';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const {
    dashboardData,
    progress,
    isLoading,
    isEnrolling,
    enrollInBatch,
    openCheckout,
  } = useDashboard();

  const workshops = dashboardData?.workshops || [];
  const availableWorkshops = dashboardData?.availableWorkshops || [];
  const assignments = dashboardData?.assignments || [];
  const submissions = dashboardData?.submissions || [];
  const certificates = dashboardData?.certificates || [];
  const hasConfirmedEnrollment = Boolean(
    dashboardData?.hasConfirmedEnrollment || workshops.some((w: any) => w.isAuthorized)
  );

  const confirmedWorkshop = workshops.find((w: any) => w.isAuthorized) || null;
  const pendingWorkshop = workshops.find((w: any) => !w.isAuthorized) || null;
  const preservedBatchId =
    searchParams.get('batch') || sessionStorage.getItem('ailp_selected_batch');

  // Scroll to available workshops when clicking Explore Workshops
  const scrollToBatches = () => {
    const el = document.getElementById('available-batches');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (searchParams.get('batch')) {
      sessionStorage.setItem('ailp_selected_batch', searchParams.get('batch')!);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="p-12 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="text-xs font-semibold">Loading your workspace...</span>
      </div>
    );
  }

  // ============================================================================
  // USER TYPE 2: REGISTERED USER (Signed In, No Confirmed Enrollments Yet)
  // ============================================================================
  if (!hasConfirmedEnrollment) {
    const highlightedBatch =
      availableWorkshops.find(
        (b: any) => b._id === preservedBatchId || b.batchCode === preservedBatchId
      ) || availableWorkshops[0];

    // Case A: User has already reserved a seat and payment is pending
    if (pendingWorkshop) {
      const basePrice = pendingWorkshop.workshop?.price?.basePrice || 1999;
      const gstAmount = Math.round(basePrice * 0.18);
      const totalAmount = basePrice + gstAmount;

      return (
        <div className="space-y-5">
          {/* 1. Focused Compact Pending Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50/90 via-white to-blue-50/60 border border-amber-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  Seat Reserved • Payment Pending
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  ID: #{pendingWorkshop.enrollmentId?.slice(-8) || pendingWorkshop.enrollmentId}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                {pendingWorkshop.workshop?.title}
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Your seat in cohort <strong className="text-[#0F172A]">{pendingWorkshop.workshop?.batchCode}</strong> is temporarily held. Complete your checkout to confirm admission and unlock the live interactive classroom, prompt libraries, and project repos.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => openCheckout(pendingWorkshop.enrollmentId)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Complete Payment (₹{totalAmount.toLocaleString('en-IN')})</span>
              </button>
            </div>
          </div>

          {/* 2. Compact 4-Card Quick Stat Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Dates</div>
                <div className="text-xs font-bold text-[#0F172A] truncate">Nov 14 – 15, 2026</div>
                <div className="text-[10px] text-blue-600 font-medium truncate">Saturday & Sunday</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Schedule</div>
                <div className="text-xs font-bold text-[#0F172A] truncate">10:00 AM – 3:00 PM IST</div>
                <div className="text-[10px] text-indigo-600 font-medium truncate">10 Hours Live Training</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Curriculum</div>
                <div className="text-xs font-bold text-[#0F172A] truncate">8+ AI Tools & 5 Projects</div>
                <div className="text-[10px] text-purple-600 font-medium truncate">Hands-on Labs</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Status</div>
                <div className="text-xs font-bold text-amber-700 truncate">Payment Pending</div>
                <div className="text-[10px] text-slate-500 font-medium truncate">Seat Reserved for You</div>
              </div>
            </div>
          </div>

          {/* 3. Balanced 2-Column Hub (8 cols / 4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column (8 cols): Workshop Details, Curriculum, and Prerequisites */}
            <div className="lg:col-span-8 space-y-4">
              {/* Workshop Overview Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F172A]">Reserved Workshop Details</h3>
                    <p className="text-xs text-slate-500">Live 2-day interactive bootcamp led by senior industry AI architects</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {pendingWorkshop.workshop?.batchCode || 'AILP-2026-NOV-14'}
                  </span>
                </div>

                {/* Mentor Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
                  <img
                    src={
                      pendingWorkshop.workshop?.instructor?.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                    }
                    alt="Instructor"
                    className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0F172A]">
                      {pendingWorkshop.workshop?.instructor?.name || 'Vikram Malhotra'}
                    </div>
                    <div className="text-[11px] text-blue-600 font-medium">
                      {pendingWorkshop.workshop?.instructor?.role || 'Staff AI Engineer & Former ML Lead'}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {pendingWorkshop.workshop?.instructor?.bio || 'Over 12 years building production software and 4 years leading enterprise LLM integrations.'}
                    </p>
                  </div>
                </div>

                {/* Included Deliverables */}
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Included with Enrollment
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Live HD Interactive Video Sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>100+ Production Prompt Templates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Capstone Project Review & Mentoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Cryptographically Signed Certificate</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Day Syllabus Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0F172A]">2-Day Hands-On Curriculum</h3>
                    <p className="text-xs text-slate-500">Structured for immediate workplace applicability with live coding</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    10 Modules
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        Day 1 • Saturday
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">10 AM – 3 PM IST</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Prompt Architecture & Agentic Workflows</h4>
                    <ul className="space-y-1 text-[11px] text-slate-600 list-none p-0 m-0">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                        <span>System Prompting & Multi-turn Context Windows</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                        <span>Structured Outputs & JSON Schema Generation</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                        <span>Multi-Modal Prompting (Image, Audio, PDF)</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                        <span>Lab: Build an Autonomous Research Agent</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        Day 2 • Sunday
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">10 AM – 3 PM IST</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Full-Stack AI Apps & Deployment</h4>
                    <ul className="space-y-1 text-[11px] text-slate-600 list-none p-0 m-0">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0 mt-0.5" />
                        <span>Function Calling & Tool Execution with APIs</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0 mt-0.5" />
                        <span>RAG Architecture with Pinecone Vector DB</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0 mt-0.5" />
                        <span>AI Workflow Automation with n8n & Webhooks</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-purple-600 shrink-0 mt-0.5" />
                        <span>Capstone: Deploy Live AI Micro-SaaS to Web</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Prerequisites Strip */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Student Prerequisites & Preparation
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="font-bold text-[#0F172A]">1. Laptop & Browser</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Windows, Mac, or Linux with Chrome/Edge.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="font-bold text-[#0F172A]">2. Free AI Accounts</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Free OpenAI, Anthropic Claude, and Cursor accounts.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="font-bold text-[#0F172A]">3. Zero Coding Barrier</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Beginner-friendly step-by-step guidance provided.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Order Summary & Support */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-slate-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Bootcamp Tuition</span>
                    <span className="font-semibold text-slate-800">₹{basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-slate-800">₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-sm font-black text-[#0F172A]">
                    <span>Total Amount</span>
                    <span className="text-blue-600 text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => openCheckout(pendingWorkshop.enrollmentId)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{totalAmount.toLocaleString('en-IN')} to Confirm</span>
                </button>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Razorpay 256-bit SSL encrypted checkout</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Instant confirmation & GST invoice sent to email</span>
                  </div>
                </div>
              </div>

              {/* Admissions Assistance Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-[#0F172A]">Need Assistance?</div>
                <p className="text-[11px] leading-relaxed">
                  Questions about batch timing or invoices? Reach out to our admissions desk at{' '}
                  <a href="mailto:support@ailaunchpad.edu" className="text-blue-600 font-semibold hover:underline">
                    support@ailaunchpad.edu
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Case B: User has NOT selected or reserved any batch yet
    const onboardingSteps = [
      {
        num: 1,
        title: 'Confirm Your Cohort',
        desc: 'Review and select the upcoming workshop cohort (max 60 learners).',
        icon: ClipboardCheck,
        badgeClass: 'bg-[#EBF2FF] text-[#1D4ED8]',
        iconClass: 'bg-blue-50 text-blue-600 border-blue-100',
      },
      {
        num: 2,
        title: 'Complete Verified Payment',
        desc: 'Pay securely via Razorpay (UPI, Cards, NetBanking) with instant GST receipt.',
        icon: CreditCard,
        badgeClass: 'bg-purple-50 text-purple-600',
        iconClass: 'bg-purple-50 text-purple-600 border-purple-100',
      },
      {
        num: 3,
        title: 'Start Learning Immediately',
        desc: 'Get access to live classes, slides, prompt templates, and assignments.',
        icon: GraduationCap,
        badgeClass: 'bg-emerald-50 text-emerald-700',
        iconClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      },
    ];

    return (
      <div className="space-y-4 sm:space-y-5">
        {/* 1. Sky-Blue Executive Welcome Hero Banner */}
        <div className="relative overflow-hidden p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-[#EEF4FF] via-[#DCEAFE] to-[#C8DDFD] text-[#0F172A] border border-[#CFE0FF] shadow-[0_8px_28px_-10px_rgba(37,99,235,0.2)]">
          {/* Subtle Sweeping Wave Backdrop */}
          <svg
            aria-hidden="true"
            viewBox="0 0 600 220"
            className="pointer-events-none absolute right-0 top-0 h-full w-2/3 opacity-45"
            preserveAspectRatio="none"
          >
            <path
              d="M120 220 C220 120 340 40 600 10 L600 220 Z"
              fill="url(#welcomeWaveGrad)"
            />
            <defs>
              <linearGradient id="welcomeWaveGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.35" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-blue-200/80 text-[#1D4ED8] text-[11px] font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>Welcome to AI Launchpad</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B1F44]">
                Hello, {user?.name || 'Learner'}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Your learning journey is ready! Enroll in the upcoming 2-Day Hands-On AI Bootcamp cohort below to unlock live classes, prompt libraries, assignments, and your verified certificate.
              </p>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0">
              {/* Crisp 3D Glassmorphic AI Laptop & Pedestal Vector Visual */}
              <div className="hidden md:flex items-center justify-center w-44 h-28 shrink-0">
                <svg
                  viewBox="0 0 220 140"
                  className="w-full h-full drop-shadow-[0_12px_20px_rgba(37,99,235,0.22)]"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="laptopScreenGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="55%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#1E3A8A" />
                    </linearGradient>
                    <linearGradient id="podiumGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#E0ECFF" />
                      <stop offset="50%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#BFDBFE" />
                    </linearGradient>
                  </defs>
                  {/* Soft Glowing Aura */}
                  <ellipse cx="110" cy="112" rx="76" ry="18" fill="#93C5FD" opacity="0.35" />
                  {/* Circular Frosted Podium */}
                  <ellipse cx="110" cy="108" rx="64" ry="15" fill="url(#podiumGrad)" stroke="#93C5FD" strokeWidth="1.5" />
                  <ellipse cx="110" cy="105" rx="54" ry="11" fill="#F8FAFF" opacity="0.9" />
                  {/* Laptop Display Shell */}
                  <g transform="translate(52, 20)">
                    <rect
                      x="18"
                      y="2"
                      width="84"
                      height="56"
                      rx="8"
                      transform="skewY(-5)"
                      fill="#FFFFFF"
                      stroke="#BFDBFE"
                      strokeWidth="2"
                    />
                    <rect
                      x="23"
                      y="7"
                      width="74"
                      height="46"
                      rx="5"
                      transform="skewY(-5)"
                      fill="url(#laptopScreenGrad)"
                    />
                    <text
                      x="60"
                      y="36"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="21"
                      fontWeight="900"
                      fontFamily="sans-serif"
                      transform="skewY(-5)"
                      letterSpacing="1"
                    >
                      AI
                    </text>
                    {/* Laptop Base Deck */}
                    <polygon
                      points="12,56 96,49 112,67 26,75"
                      fill="#F8FAFF"
                      stroke="#BFDBFE"
                      strokeWidth="1.8"
                    />
                    <polygon
                      points="46,61 78,58 84,65 52,68"
                      fill="#DBEAFE"
                    />
                  </g>
                  {/* Orbiting Star Sparkles */}
                  <path d="M40 36 L43 44 L51 47 L43 50 L40 58 L37 50 L29 47 L37 44 Z" fill="#FFFFFF" opacity="0.95" />
                  <path d="M174 28 L176 34 L182 36 L176 38 L174 44 L172 38 L166 36 L172 34 Z" fill="#FFFFFF" opacity="0.9" />
                  <circle cx="182" cy="76" r="3" fill="#60A5FA" opacity="0.7" />
                  <circle cx="34" cy="84" r="2.5" fill="#FFFFFF" opacity="0.8" />
                </svg>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={scrollToBatches}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A2558] hover:bg-[#081E4A] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  <span>Enroll Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/dashboard/profile"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-[#0F172A] text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
                >
                  <User className="w-4 h-4 text-[#0A2558]" />
                  <span>Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Connected 3-Step Onboarding Strip With Directional Arrows */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 lg:gap-2">
          {onboardingSteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <React.Fragment key={step.num}>
                <div className="relative flex-1 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_16px_-6px_rgba(15,23,42,0.06)] flex items-center gap-3.5">
                  <span
                    className={`w-6 h-6 rounded-md text-[11px] font-extrabold flex items-center justify-center shrink-0 self-start ${step.badgeClass}`}
                  >
                    {step.num}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${step.iconClass}`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[#0F172A]">{step.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
                {idx < onboardingSteps.length - 1 && (
                  <ArrowRight
                    aria-hidden="true"
                    className="hidden lg:block w-4 h-4 text-slate-400 shrink-0 mx-0.5"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 3. Preserved Workshop Selection (Only shown if multiple cohorts exist) */}
        {availableWorkshops.length > 1 && highlightedBatch && preservedBatchId && (
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                Saved Selection
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A]">
                Continue Enrolling in {highlightedBatch.batchCode}
              </h3>
              <p className="text-xs text-slate-600">
                {new Date(highlightedBatch.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                –{' '}
                {new Date(highlightedBatch.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                • {highlightedBatch.timings} • ₹
                {highlightedBatch.price?.basePrice?.toLocaleString('en-IN')} + 18% GST
              </p>
            </div>
            <button
              disabled={isEnrolling}
              onClick={() => enrollInBatch(highlightedBatch._id)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A2558] hover:bg-[#081E4A] text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0 disabled:opacity-60"
            >
              <span>{isEnrolling ? 'Reserving...' : 'Continue to Payment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4. Available Training Session(s) — Full-Width Responsive Showcase */}
        {!hasConfirmedEnrollment && !pendingWorkshop && workshops.length === 0 && availableWorkshops.length > 0 && (
          <div id="available-batches" className="space-y-3.5 scroll-mt-20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-[#0A2558] shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#0B1F44]">
                  Upcoming Workshop Cohort
                </h3>
                <p className="text-xs text-slate-500">
                  Review the full 2-day bootcamp details and confirm your enrollment.
                </p>
              </div>
            </div>

            {availableWorkshops.length === 1 ? (
              (() => {
                const batch = availableWorkshops[0];
                const basePrice = batch.price?.basePrice ?? 1999;
                const gstAmount = Math.round(basePrice * 0.18);
                const totalAmount = basePrice + gstAmount;
                const isFree = Boolean(batch.price?.isFree || basePrice === 0);
                const dateRange = `${new Date(batch.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })} – ${new Date(batch.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}`;

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Left 8 Columns: Complete Workshop Details & 2-Day Curriculum Preview */}
                    <div className="lg:col-span-8 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_6px_24px_-8px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        {/* Batch Header Pills */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#0B1F44] bg-[#F7F9FD] px-3 py-1 rounded-full border border-slate-200">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              {batch.batchCode}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                              <Users className="w-3.5 h-3.5 text-emerald-600" />
                              {batch.availableSeats} of {batch.capacity} seats open
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-[#F7F9FD] px-3 py-1 rounded-full border border-slate-200">
                            <Video className="w-3.5 h-3.5 text-blue-600" />
                            Live Online Bootcamp
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-lg sm:text-2xl font-black text-[#0B1F44] tracking-tight">
                            {batch.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                            {batch.description}
                          </p>
                        </div>

                        {/* Dates & Timings Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                          <div className="p-3.5 rounded-2xl bg-[#F7F9FD] border border-slate-200/80 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Dates
                              </div>
                              <div className="font-bold text-[#0F172A]">{dateRange} (Sat &amp; Sun)</div>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#F7F9FD] border border-slate-200/80 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Schedule
                              </div>
                              <div className="font-bold text-[#0F172A]">{batch.timings} • 10 Hrs Live</div>
                            </div>
                          </div>
                        </div>

                        {/* Curriculum Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          <div className="p-4 rounded-2xl bg-[#F7F9FD] border border-slate-200/80 space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-100/80 text-blue-700 inline-block">
                              Day 1 • Saturday
                            </span>
                            <div className="text-xs sm:text-sm font-bold text-[#0F172A]">
                              Prompt Architecture &amp; AI Workflows
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Master system prompting, JSON schemas, multi-modal models (ChatGPT &amp; Claude), and build a live research agent.
                            </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-[#F7F9FD] border border-slate-200/80 space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-100/80 text-purple-700 inline-block">
                              Day 2 • Sunday
                            </span>
                            <div className="text-xs sm:text-sm font-bold text-[#0F172A]">
                              Full-Stack AI Apps &amp; Deployment
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                              Build RAG pipelines with Pinecone, connect APIs via function calling, automate with n8n, and deploy to web.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Mentor Strip */}
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F7F9FD] border border-slate-200/80 flex items-center gap-3.5">
                        <img
                          src={
                            batch.instructor?.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                          }
                          alt="Instructor"
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">
                            Lead Instructor: {batch.instructor?.name || 'Vikram Malhotra'}
                          </div>
                          <div className="text-[11px] sm:text-xs text-blue-600 font-medium truncate">
                            {batch.instructor?.role || 'Staff AI Engineer & Former ML Lead'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right 4 Columns: Enrollment Action & Price Summary */}
                    <div className="lg:col-span-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-[0_6px_24px_-8px_rgba(15,23,42,0.06)] flex flex-col justify-between space-y-5">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                              Bootcamp Enrollment
                            </span>
                            <h4 className="text-lg font-black text-[#0B1F44] mt-0.5">
                              Reserve Your Seat
                            </h4>
                          </div>
                          <div className="w-9 h-9 rounded-xl bg-[#EDF4FF] text-[#1D4ED8] border border-blue-200/70 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                          <div className="flex items-center justify-between">
                            <span>Bootcamp Tuition</span>
                            <span className="font-bold text-[#0F172A]">
                              {isFree ? 'Free' : `₹${basePrice.toLocaleString('en-IN')}`}
                            </span>
                          </div>
                          {!isFree && (
                            <div className="flex items-center justify-between">
                              <span>GST (18%)</span>
                              <span className="font-bold text-[#0F172A]">
                                ₹{gstAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-black text-[#0F172A]">
                            <span className="text-sm">Total Payable</span>
                            <span className="text-2xl text-blue-600">
                              {isFree ? 'Free' : `₹${totalAmount.toLocaleString('en-IN')}`}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-700">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>10 Hours of Live HD Training</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>100+ Prompt &amp; Workflow Templates</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Lifetime Recordings &amp; Code Repos</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Verified Certificate of Completion</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <button
                          disabled={isEnrolling}
                          onClick={() => enrollInBatch(batch._id)}
                          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#0A2558] hover:bg-[#081E4A] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
                        >
                          <span>
                            {isEnrolling
                              ? 'Reserving Seat...'
                              : isFree
                              ? 'Enroll for Free'
                              : `Enroll & Pay ₹${totalAmount.toLocaleString('en-IN')}`}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>100% Satisfaction Guarantee • Instant Receipt</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWorkshops.map((batch: any) => {
                  const basePrice = batch.price?.basePrice ?? 1999;
                  const isFree = Boolean(batch.price?.isFree || basePrice === 0);
                  const dateRange = `${new Date(batch.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })} – ${new Date(batch.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}`;

                  return (
                    <div
                      key={batch._id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-2xs flex flex-col justify-between space-y-4 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                            {batch.batchCode}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            {batch.availableSeats} of {batch.capacity} seats open
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-extrabold text-[#0F172A]">{batch.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {batch.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="font-semibold text-[#0F172A] truncate">{dateRange}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="font-semibold text-[#0F172A] truncate">{batch.timings}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                          <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>
                            Instructor: <strong className="text-[#0F172A]">{batch.instructor?.name || 'Vikram Malhotra'}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Tuition Fee
                          </span>
                          <span className="text-lg font-black text-[#0F172A]">
                            {isFree ? 'Free' : `₹${basePrice.toLocaleString('en-IN')}`}
                          </span>
                          {!isFree && (
                            <span className="text-[10px] text-slate-500 ml-1">+ 18% GST</span>
                          )}
                        </div>

                        <button
                          disabled={isEnrolling}
                          onClick={() => enrollInBatch(batch._id)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
                        >
                          <span>{isFree ? 'Enroll for Free' : 'Enroll & Pay'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // USER TYPE 3: ENROLLED STUDENT (Signed In With Confirmed Workshop Enrollment)
  // ============================================================================
  const currentProgress = progress[0] || {
    percentage: 25,
    day1Attended: false,
    day2Attended: false,
    projectSubmitted: submissions.length > 0,
    certificateEarned: certificates.length > 0,
  };
  const sessions = confirmedWorkshop?.sessions || [];
  const resources = confirmedWorkshop?.resources || [];
  const nextSession = sessions[0] || dashboardData?.upcomingClass;
  const workshopInfo = confirmedWorkshop?.workshop || {};
  const batchCode = workshopInfo.batchCode || 'AILP-2026-NOV-14';
  const instructorName = workshopInfo.instructor?.name || 'Vikram Malhotra';
  const instructorRole = workshopInfo.instructor?.role || 'Staff AI Engineer & Former ML Lead';
  const meetingPasscode = confirmedWorkshop?.sessionAccess?.meetingPasscode || 'AILP2026';
  const joinUrl = confirmedWorkshop?.sessionAccess?.joinUrl || nextSession?.liveSessionUrl;
  const dateRange = workshopInfo.startDate
    ? `${new Date(workshopInfo.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} – ${new Date(workshopInfo.endDate || workshopInfo.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`
    : 'Nov 14 – Nov 15, 2026';

  const resourceIconMap: Record<string, { icon: React.ComponentType<any>; color: string }> = {
    slides: { icon: Presentation, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    prompts: { icon: Cpu, color: 'bg-purple-50 text-purple-600 border-purple-200' },
    projects: { icon: Code2, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    notes: { icon: FileText, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  };

  const displayTasks =
    assignments.length > 0
      ? assignments.slice(0, 3)
      : [
          {
            _id: 'task-day1',
            dayNumber: 1,
            title: 'Build a Structured Prompt & Custom AI Assistant',
            description:
              'Design a domain-specific system prompt using JSON output schemas and multi-modal grounding.',
            maxScore: 50,
          },
          {
            _id: 'task-day2',
            dayNumber: 2,
            title: 'Deploy an Automated RAG Workflow Prototype',
            description:
              'Connect a vector store, configure tool calling, and publish your capstone workflow repository.',
            maxScore: 100,
          },
        ];

  return (
    <div className="space-y-5">
      {/* 1. Executive Student Welcome Hero Banner */}
      <div className="relative overflow-hidden p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#081E4A] via-[#0F2A6B] to-[#1D4ED8] text-white border border-blue-900/40 shadow-md">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-cyan-400/20 blur-3xl"
        />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Enrolled Student • {batchCode}</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-blue-100">
                ID: {confirmedWorkshop?.enrollmentId || 'AILP-PASS'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.name || 'Student'}!
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              Your learning workspace for <strong className="text-white">{workshopInfo.title || 'AI Launchpad Bootcamp'}</strong> is unlocked. Join live interactive sessions, explore study materials, submit your assignments, and track your completion progress below.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/dashboard/live-classes"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#081E4A] text-xs font-extrabold shadow-sm transition-all"
              >
                <Video className="w-4 h-4 text-blue-600" />
                <span>Open Live Classroom</span>
              </Link>
              <Link
                to="/dashboard/materials"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 border border-white/25 text-white text-xs font-bold transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Learning Materials</span>
              </Link>
              <Link
                to="/dashboard/assignments"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Assignments</span>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-white/20 shadow-lg bg-[#081E4A]">
              <img
                src="/assets/hero-cohort-showcase.jpg"
                alt="AI Launchpad Cohort"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081e4a]/95 via-[#081e4a]/45 to-transparent flex items-end p-3.5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    Active Weekend Cohort
                  </div>
                  <div className="text-sm font-extrabold text-white">{dateRange}</div>
                  <div className="text-[11px] text-slate-200">
                    {workshopInfo.timings || '10:00 AM – 3:00 PM IST'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Dashboard KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Cohort
            </div>
            <div className="text-sm font-black text-[#0F172A] truncate">{batchCode}</div>
            <div className="text-[11px] text-slate-500 truncate">{dateRange}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Classes
            </div>
            <div className="text-sm font-black text-[#0F172A] truncate">
              {sessions.length || 2} Live Sessions
            </div>
            <div className="text-[11px] font-mono text-purple-600 font-semibold truncate">
              Passcode: {meetingPasscode}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Learning Materials
            </div>
            <div className="text-sm font-black text-[#0F172A] truncate">
              {resources.length} Resources Unlocked
            </div>
            <div className="text-[11px] text-slate-500 truncate">Slides, Prompts & Code</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Overall Progress
            </div>
            <div className="text-sm font-black text-[#0F172A] truncate">
              {currentProgress.percentage}% Complete
            </div>
            <div className="text-[11px] text-emerald-700 font-medium truncate">
              {submissions.length}/{Math.max(1, displayTasks.length)} Tasks Submitted
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Interactive Learning Widgets Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Live Classes + Assignments */}
        <div className="xl:col-span-7 flex flex-col gap-5">
          {/* Widget A: Live Classes */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                    Live Classes & Classroom Schedule
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Attend interactive Zoom / Google Meet sessions led by {instructorName}
                  </p>
                </div>
              </div>

              <Link
                to="/dashboard/live-classes"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <span>All Sessions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(sessions.length > 0 ? sessions.slice(0, 2) : [nextSession].filter(Boolean)).map(
                (session: any, idx: number) => (
                  <div
                    key={session._id || idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          Day {session.dayNumber || idx + 1} Live
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                          {session.status || 'Scheduled'}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug">
                        {session.title}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-purple-600" />
                        {session.startTime || '10:00 AM'} – {session.endTime || '3:00 PM'}
                      </span>
                      <span className="font-mono font-bold text-indigo-600">{meetingPasscode}</span>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold text-[#0F172A] block">
                    Virtual Classroom Ready
                  </span>
                  <span className="text-[11px] text-slate-600">
                    Passcode: <strong className="font-mono text-blue-700">{meetingPasscode}</strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {joinUrl && joinUrl.startsWith('http') ? (
                  <a
                    href={joinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Join Live Room</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    to="/dashboard/live-classes"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Open Classroom</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Widget B: Assignments & Capstone */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                      Assignments &amp; Capstone Deliverables
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Complete hands-on labs and submit your capstone project for mentor review
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard/assignments"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <span>Open Submissions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5">
                {displayTasks.map((task: any, idx: number) => {
                  const isSubmitted = submissions.length > idx;
                  return (
                    <div
                      key={task._id || task.title}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                            Day {task.dayNumber || idx + 1} Lab
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {task.maxScore || 100} pts
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 line-clamp-1">
                          {task.description}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 self-start sm:self-center ${
                          isSubmitted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isSubmitted ? 'Submitted' : 'Pending Submission'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {submissions.length > 0
                  ? `${submissions.length} project deliverable(s) uploaded`
                  : 'Submit your project repo or prototype link to unlock certification'}
              </span>
              <Link
                to="/dashboard/assignments"
                className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-700 shrink-0"
              >
                <span>{submissions.length > 0 ? 'View Feedback' : 'Submit Project'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Overall Progress + Learning Materials */}
        <div className="xl:col-span-5 flex flex-col gap-5">
          {/* Widget C: Progress & Certificate Milestones */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                    Overall Progress
                  </h3>
                  <p className="text-[11px] text-slate-500">Bootcamp completion &amp; milestones</p>
                </div>
              </div>
              <span className="text-2xl font-black text-blue-600">
                {currentProgress.percentage}%
              </span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.max(15, currentProgress.percentage)}%` }}
              />
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: `Confirmed Seat (${batchCode})`, done: true },
                { label: 'Day 1: Prompt Engineering Live Lab', done: Boolean(currentProgress.day1Attended) },
                { label: 'Day 2: RAG & Agent Workflows Lab', done: Boolean(currentProgress.day2Attended) },
                {
                  label: 'Capstone Project & Certificate',
                  done: submissions.length > 0 || certificates.length > 0,
                },
              ].map((step) => (
                <div
                  key={step.label}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                    step.done
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 font-semibold'
                      : 'bg-slate-50 border-slate-200/80 text-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0 truncate">
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        step.done ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                    />
                    <span className="truncate">{step.label}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase shrink-0">
                    {step.done ? 'Done' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>

            <Link
              to="/dashboard/certificates"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>View Certificate Eligibility</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Widget D: Learning Materials */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                      Learning Materials
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Unlocked slides, prompts, PDFs &amp; code repos
                    </p>
                  </div>
                </div>
                <Link
                  to="/dashboard/materials"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-2">
                {resources.slice(0, 4).map((res: any) => {
                  const meta = resourceIconMap[res.section] || resourceIconMap.notes;
                  const Icon = meta.icon;
                  return (
                    <Link
                      key={res.id || res.title}
                      to="/dashboard/materials"
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 flex items-center justify-between gap-3 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0F172A] group-hover:text-blue-700 truncate">
                            {res.title}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{res.type}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        Open
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Cohort & Quick Links Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/dashboard/workshops"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition-all shadow-2xs flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-blue-600 truncate">
              My Workshops &amp; Syllabus
            </h4>
            <p className="text-[11px] text-slate-500 truncate">
              Full Day 1 &amp; Day 2 curriculum breakdown
            </p>
          </div>
        </Link>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <img
            src={
              workshopInfo.instructor?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            }
            alt={instructorName}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#0F172A] truncate">
              Mentor: {instructorName}
            </div>
            <div className="text-[11px] text-blue-600 font-medium truncate">
              {instructorRole}
            </div>
          </div>
        </div>

        <Link
          to="/dashboard/profile"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 transition-all shadow-2xs flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-blue-600 truncate">
              Student Profile &amp; Support
            </h4>
            <p className="text-[11px] text-slate-500 truncate">
              Update account details &amp; preferences
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};
