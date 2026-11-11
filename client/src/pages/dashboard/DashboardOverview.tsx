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
    return (
      <div className="space-y-6">
        {/* 1. Personalized Welcome Banner (Light Theme) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40 text-[#0F172A] border border-blue-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Welcome to AI Launchpad</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A]">
              Hello, {user?.name || 'Learner'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Your learner account is ready. Select an upcoming 2-Day Hands-On AI Bootcamp cohort below and complete enrollment to unlock your live classes, prompt libraries, assignments, and certificate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={scrollToBatches}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <span>Explore Workshops</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/dashboard/profile"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0F172A] text-xs font-semibold shadow-2xs transition-colors"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>Profile Settings</span>
            </Link>
          </div>
        </div>

        {/* 2. Clear 3-Step Enrollment Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-200">
              1
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A]">Choose Your Weekend Batch</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Pick a Saturday & Sunday cohort that fits your schedule. Seats are capped at 60 learners.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 font-black text-xs flex items-center justify-center shrink-0 border border-purple-200">
              2
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A]">Complete Verified Payment</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Confirm your seat securely via Razorpay (UPI, Cards, NetBanking) with instant GST receipt.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200">
              3
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A]">Start Learning Immediately</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Your dashboard automatically unlocks Live Classes, Slides, Prompt Templates, and Assignments.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Preserved Workshop Selection from Public Landing Page */}
        {highlightedBatch && preservedBatchId && (
          <div className="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                Saved Selection
              </span>
              <h3 className="text-base font-extrabold text-[#0F172A]">
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
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0 disabled:opacity-60"
            >
              <span>{isEnrolling ? 'Reserving...' : 'Continue to Enrollment & Payment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 5. Available Workshop Cohorts - Display all sessions initially; once selection for payment is made, this is hidden */}
        {!hasConfirmedEnrollment && !pendingWorkshop && workshops.length === 0 && availableWorkshops.length > 0 && (
          <div id="available-batches" className="space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A]">Available Training Sessions</h3>
                <p className="text-xs text-slate-500">
                  All upcoming workshop sessions are shown below. Select your preferred cohort to proceed to payment.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 shadow-xs flex flex-col justify-between space-y-5 transition-all"
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
  const nextSession = confirmedWorkshop?.sessions?.[0] || dashboardData?.upcomingClass;

  return (
    <div className="space-y-6">
      {/* 1. Enrolled Student Welcome Banner & Continue Learning Button */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40 text-[#0F172A] border border-blue-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed Student • {confirmedWorkshop.workshop?.batchCode}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
            Welcome back, {user?.name || 'Student'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            You are enrolled in <strong className="text-[#0F172A]">{confirmedWorkshop.workshop?.title}</strong>. Pick up right where you left off with your live sessions, learning materials, and capstone assignment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/dashboard/materials"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboard/live-classes"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0F172A] text-xs font-semibold shadow-2xs transition-colors"
          >
            <Video className="w-4 h-4 text-blue-600" />
            <span>Live Classes</span>
          </Link>
        </div>
      </div>

      {/* 2. Core Student Overview Cards: Current Workshop, Upcoming Class, Overall Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card A: Current Workshop */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                Current Workshop
              </span>
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">
                {confirmedWorkshop.workshop?.title}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Batch: {confirmedWorkshop.workshop?.batchCode}
              </p>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  {new Date(confirmedWorkshop.workshop?.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  –{' '}
                  {new Date(confirmedWorkshop.workshop?.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Instructor: {confirmedWorkshop.workshop?.instructor?.name || 'Vikram Malhotra'}</span>
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/workshops"
            className="inline-flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            <span>View Curriculum & Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card B: Upcoming Class */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                Upcoming Class
              </span>
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">
                {nextSession?.title || 'Day 1: LLM Foundations & Prompt Engineering'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {confirmedWorkshop.workshop?.timings || '10:00 AM – 3:00 PM IST'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
              <span className="text-slate-500">Meeting Passcode:</span>
              <span className="font-mono font-bold text-indigo-600">
                {confirmedWorkshop.sessionAccess?.meetingPasscode || 'AILP2026'}
              </span>
            </div>
          </div>

          <Link
            to="/dashboard/live-classes"
            className="inline-flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-purple-600 hover:text-purple-700"
          >
            <span>Open Live Classroom</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card C: Overall Progress */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Overall Progress
              </span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-[#0F172A]">
                {currentProgress.percentage}%
              </span>
              <span className="text-xs text-slate-500 font-medium">Bootcamp Completion</span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all"
                style={{ width: `${Math.max(15, currentProgress.percentage)}%` }}
              />
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Workshop Seat Confirmed</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  submissions.length > 0 ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {submissions.length > 0
                    ? 'Capstone Assignment Submitted'
                    : 'Submit Capstone Assignment'}
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/certificates"
            className="inline-flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>Check Certificate Eligibility</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3. Quick Navigation Cards to Learning Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/dashboard/materials"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 transition-all shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-indigo-600 transition-colors">
            Learning Materials
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Access slides, notes, prompt templates, and starter project repositories.
          </p>
        </Link>

        <Link
          to="/dashboard/assignments"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 transition-all shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-purple-600 transition-colors">
            Assignments & Feedback
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            View assigned tasks, submit your capstone project, and read instructor feedback.
          </p>
        </Link>

        <Link
          to="/dashboard/certificates"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 transition-all shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Award className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-indigo-600 transition-colors">
            Certificates
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Track completion eligibility, download your certificate, and verify credentials.
          </p>
        </Link>
      </div>
    </div>
  );
};
