import React, { useEffect, useState } from 'react';
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
  const [overviewSelectedBatchId, setOverviewSelectedBatchId] = useState<string | null>(null);

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

        {/* 2. Clear 3-Step Enrollment & Payment Guide */}
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
          <div className="p-6 rounded-3xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                  Seat Reserved • Payment Pending
                </span>
                <span className="text-xs font-mono font-bold text-slate-600">
                  ID: {pendingWorkshop.enrollmentId}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A]">
                {pendingWorkshop.workshop?.title} ({pendingWorkshop.workshop?.batchCode})
              </h3>
              <p className="text-xs text-slate-600">
                Complete your payment to confirm your enrollment and unlock all learning modules.
              </p>
            </div>

            <button
              onClick={() => openCheckout(pendingWorkshop.enrollmentId)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>Complete Payment Now</span>
            </button>
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

        {/* 5. Available Workshop Cohort (Based on selection, only 1 selected session is visible) */}
        <div id="available-batches" className="space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-[#0F172A]">Upcoming Workshop Cohort</h3>
              <p className="text-xs text-slate-500">
                Reserve your seat in the upcoming live weekend cohort below and proceed to checkout.
              </p>
            </div>

            {/* If multiple available workshops exist, provide clean tabs to switch */}
            {availableWorkshops.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                {availableWorkshops.map((b: any) => {
                  const isSelected =
                    (overviewSelectedBatchId && overviewSelectedBatchId === b._id) ||
                    (!overviewSelectedBatchId && (highlightedBatch?._id === b._id || availableWorkshops[0]?._id === b._id));
                  return (
                    <button
                      key={b._id}
                      type="button"
                      onClick={() => setOverviewSelectedBatchId(b._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-[#0F172A]'
                      }`}
                    >
                      {b.batchCode}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 max-w-2xl gap-5">
            {[
              (overviewSelectedBatchId
                ? availableWorkshops.find((b: any) => b._id === overviewSelectedBatchId)
                : highlightedBatch) || availableWorkshops[0],
            ]
              .filter(Boolean)
              .map((batch: any) => {
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
