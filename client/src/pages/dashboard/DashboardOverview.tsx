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

    return (
      <div className="space-y-8">
        {/* 1. Personalized Welcome Banner (Light Theme) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40 text-[#0F172A] border border-blue-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Welcome to AI Launchpad</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0F172A]">
              Hello, {user?.name || 'Learner'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Your learner account is ready. Select an upcoming 2-Day Hands-On AI Bootcamp cohort below and complete enrollment to unlock your live classes, prompt libraries, assignments, and certificate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={scrollToBatches}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <span>Explore Workshops</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/dashboard/profile"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0F172A] text-xs font-semibold shadow-2xs transition-colors"
            >
              <User className="w-4 h-4 text-blue-600" />
              <span>Profile Settings</span>
            </Link>
          </div>
        </div>

        {/* 2. Bootstrap 5 KPI Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cohort Batch</div>
              <div className="text-sm font-black text-[#0F172A] mt-0.5">Nov 14 – 15, 2026</div>
              <div className="text-[11px] font-semibold text-blue-600">Saturday & Sunday</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Training</div>
              <div className="text-sm font-black text-[#0F172A] mt-0.5">10 Hours Total</div>
              <div className="text-[11px] font-semibold text-indigo-600">10:00 AM – 3:00 PM IST</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Toolkit</div>
              <div className="text-sm font-black text-[#0F172A] mt-0.5">8+ Industry Tools</div>
              <div className="text-[11px] font-semibold text-purple-600">5 Capstone Projects</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Certification</div>
              <div className="text-sm font-black text-[#0F172A] mt-0.5">Alumni Credential</div>
              <div className="text-[11px] font-semibold text-emerald-600">Cryptographically Signed</div>
            </div>
          </div>
        </div>

        {/* 3. Clear 3-Step Enrollment & Payment Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-200">
              1
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A]">Choose Your Weekend Batch</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Pick a Saturday & Sunday cohort that fits your schedule. Seats are capped at 60 learners.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 font-black text-xs flex items-center justify-center shrink-0 border border-purple-200">
              2
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A]">Complete Verified Payment</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Confirm your seat securely via Razorpay (UPI, Cards, NetBanking) with instant GST receipt.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200">
              3
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A]">Start Learning Immediately</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Your dashboard automatically unlocks Live Classes, Slides, Prompt Templates, and Assignments.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Pending Reservation Callout (if the user already started enrollment) */}
        {pendingWorkshop && (
          <div className="space-y-6">
            {/* Top Alert Bar */}
            <div className="p-6 rounded-3xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                    Seat Reserved • Payment Pending
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    Enrollment ID: {pendingWorkshop.enrollmentId}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {pendingWorkshop.workshop?.title} ({pendingWorkshop.workshop?.batchCode})
                </h3>
                <p className="text-xs text-slate-600">
                  Your seat is temporarily reserved. Complete your payment below to confirm your admission and unlock all learning modules.
                </p>
              </div>

              <button
                onClick={() => openCheckout(pendingWorkshop.enrollmentId)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
              >
                <CreditCard className="w-4 h-4" />
                <span>Complete Payment Now</span>
              </button>
            </div>

            {/* Comprehensive Reservation & Order Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (8 cols): Cohort Details & What You'll Learn */}
              <div className="lg:col-span-8 space-y-6">
                {/* Cohort Spec Card */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-base font-extrabold text-[#0F172A]">Reserved Workshop Details</h4>
                      <p className="text-xs text-slate-500">Live 2-day interactive bootcamp led by senior industry AI architects</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {pendingWorkshop.workshop?.batchCode || 'AILP-2026-NOV-14'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase">Dates & Schedule</div>
                        <div className="text-xs font-extrabold text-[#0F172A] mt-0.5">
                          {pendingWorkshop.workshop?.startDate
                            ? `${new Date(pendingWorkshop.workshop.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })} – ${new Date(pendingWorkshop.workshop.endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}`
                            : 'Nov 14 – Nov 15, 2026'}
                        </div>
                        <div className="text-[11px] text-slate-500">Saturday & Sunday</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase">Timings & Format</div>
                        <div className="text-xs font-extrabold text-[#0F172A] mt-0.5">
                          {pendingWorkshop.workshop?.timings || '10:00 AM – 3:00 PM IST'}
                        </div>
                        <div className="text-[11px] text-slate-500">10 Hours Total • Live Online</div>
                      </div>
                    </div>
                  </div>

                  {/* Mentor Info */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
                    <img
                      src={
                        pendingWorkshop.workshop?.instructor?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                      }
                      alt="Instructor"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
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

                  {/* What Unlocks Upon Payment */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider text-slate-500">
                      Included with Your Enrollment
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Live Interactive HD Video Sessions</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>100+ Production Prompt Templates</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Capstone Project Review & Feedback</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Cryptographically Verified Certificate</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2-Day Detailed Syllabus Accordion / Timeline Card */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-[#0F172A]">2-Day Hands-On Curriculum Breakdown</h4>
                      <p className="text-xs text-slate-500">Structured for immediate workplace applicability with live coding</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      10 Modules Total
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Day 1 */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          Day 1 • Saturday (5 Hours)
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">10 AM – 3 PM IST</span>
                      </div>
                      <h5 className="text-xs font-extrabold text-[#0F172A]">Prompt Architecture, Multi-Modal AI & Agentic Workflows</h5>
                      <ul className="space-y-1.5 text-[11px] text-slate-600">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>System Prompting & Multi-turn Context Windows (ChatGPT, Claude 3.5 Sonnet)</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>Structured Outputs & JSON Schema Generation</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>Multi-Modal Prompting (Image, Audio, PDF extraction)</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>Hands-On Lab: Build an Autonomous Research Agent</span>
                        </li>
                      </ul>
                    </div>

                    {/* Day 2 */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          Day 2 • Sunday (5 Hours)
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">10 AM – 3 PM IST</span>
                      </div>
                      <h5 className="text-xs font-extrabold text-[#0F172A]">Full-Stack AI Apps, Vector DBs & Production Deployment</h5>
                      <ul className="space-y-1.5 text-[11px] text-slate-600">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span>Function Calling & Tool Execution with External APIs</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span>RAG Architecture with Pinecone Vector Database</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span>AI Workflow Automation with n8n & Webhooks</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span>Capstone: Deploy Live AI Micro-SaaS to Production</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bootcamp Prerequisites & What to Prepare */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-sm font-extrabold text-[#0F172A]">Student Prerequisites & Preparation</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="font-bold text-[#0F172A]">1. Laptop & Browser</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Any Windows, Mac, or Linux laptop with Google Chrome or modern browser.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="font-bold text-[#0F172A]">2. Free AI Accounts</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Free tier accounts on OpenAI, Anthropic Claude, and Cursor (setup guide provided).
                      </p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="font-bold text-[#0F172A]">3. Zero Coding Barrier</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Beginner-friendly step-by-step guidance. No prior ML or Python experience needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (4 cols): Pricing Breakdown & Action */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
                  <h4 className="text-sm font-extrabold text-[#0F172A] border-b border-slate-100 pb-3">
                    Order Summary
                  </h4>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Tuition Fee</span>
                      <span className="font-semibold text-slate-800">
                        ₹{(pendingWorkshop.workshop?.price?.basePrice || 1999).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>GST (18%)</span>
                      <span className="font-semibold text-slate-800">
                        ₹{Math.round((pendingWorkshop.workshop?.price?.basePrice || 1999) * 0.18).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-black text-[#0F172A]">
                      <span>Total Due</span>
                      <span className="text-blue-600 text-base">
                        ₹{(Math.round((pendingWorkshop.workshop?.price?.basePrice || 1999) * 1.18)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openCheckout(pendingWorkshop.enrollmentId)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{(Math.round((pendingWorkshop.workshop?.price?.basePrice || 1999) * 1.18)).toLocaleString('en-IN')} to Confirm</span>
                  </button>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Razorpay 256-bit SSL encrypted checkout</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Instant confirmation & invoice sent via email</span>
                    </div>
                  </div>
                </div>

                {/* Need Assistance Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="font-bold text-[#0F172A]">Need Assistance?</div>
                  <p className="text-[11px] leading-relaxed">
                    Have questions about the cohort, group registrations, or billing? Reach out to our admissions team at{' '}
                    <a href="mailto:support@ailaunchpad.edu" className="text-blue-600 font-semibold hover:underline">
                      support@ailaunchpad.edu
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Preserved Workshop Selection from Public Landing Page */}
        {!pendingWorkshop && highlightedBatch && preservedBatchId && (
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
