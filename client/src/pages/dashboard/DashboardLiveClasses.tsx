import React from 'react';
import {
  Video,
  Lock,
  AlertCircle,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useDashboard } from './DashboardLayout';

export const DashboardLiveClasses: React.FC = () => {
  const { dashboardData, isEnrolling, enrollInBatch, openCheckout } = useDashboard();
  const workshops = dashboardData?.workshops || [];
  const availableWorkshops = dashboardData?.availableWorkshops || [];

  const primary = workshops.find((w: any) => w.isAuthorized) || workshops[0] || null;
  const previewBatch = availableWorkshops[0] || null;
  const isAuthorized = Boolean(primary?.isAuthorized);

  const activeWorkshopInfo = primary?.workshop || previewBatch;
  const sessions =
    primary?.sessions ||
    previewBatch?.sessionsPreview || [
      {
        _id: 'preview-day1',
        dayNumber: 1,
        title: 'Day 1: LLM Foundations, Prompt Engineering & Custom AI Assistants',
        startTime: '10:00 AM',
        endTime: '3:00 PM',
        timezone: 'Asia/Kolkata (IST)',
      },
      {
        _id: 'preview-day2',
        dayNumber: 2,
        title: 'Day 2: Multi-Step AI Workflows, Functional Prototyping & Capstone Lab',
        startTime: '10:00 AM',
        endTime: '3:00 PM',
        timezone: 'Asia/Kolkata (IST)',
      },
    ];

  const instructor = activeWorkshopInfo?.instructor || {
    name: 'Vikram Malhotra',
    role: 'Staff AI Engineer & Former ML Lead',
    bio: 'Over 12 years building production software and leading enterprise LLM integrations.',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Live Classes
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {isAuthorized
            ? 'Access your authorized live session links, meeting passcode, and Day 1 & Day 2 classroom schedule.'
            : 'Preview the upcoming Day 1 & Day 2 live interactive session schedule and instructor details. Live joining links unlock after verified payment.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Next Class Hero Card (Light Theme) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white text-[#0F172A] border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {isAuthorized ? 'Next Live Session' : 'Live Schedule Preview'} •{' '}
                  {activeWorkshopInfo?.batchCode || 'AILP-2026-NOV-14'}
                </span>
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
                {sessions[0]?.title || activeWorkshopInfo?.title || 'AI Launchpad Live Bootcamp'}
              </h3>
              <p className="text-xs text-slate-500">
                {primary?.sessionAccess?.platform || 'Google Meet / Zoom HD Virtual Classroom'}
              </p>
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  isAuthorized
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : primary
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {isAuthorized ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>
                  {isAuthorized
                    ? 'Authorized to Join'
                    : primary
                    ? 'Payment Pending'
                    : 'Schedule Preview • Enrollment Required'}
                </span>
              </span>
            </div>
          </div>

          {/* Join Session Action Box */}
          {isAuthorized ? (
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#0F172A]">Virtual Classroom Pass Unlocked</h4>
                <p className="text-xs text-slate-600">
                  The classroom opens 30 minutes before start time ({activeWorkshopInfo?.timings}).
                </p>
                <div className="pt-1 text-xs font-mono text-slate-600">
                  Meeting Passcode:{' '}
                  <span className="bg-white px-2.5 py-0.5 rounded border border-blue-200 font-bold text-blue-700">
                    {primary?.sessionAccess?.meetingPasscode || 'AILP2026'}
                  </span>
                </div>
              </div>

              <a
                href={primary?.sessionAccess?.joinUrl || 'https://meet.google.com/ailp-live-cohort'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Video className="w-4 h-4" />
                <span>Join Session</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-amber-900">
                    Live Classroom Joining Link Restricted
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    {primary
                      ? `Your seat reservation (${primary.enrollmentId}) is awaiting payment verification. Complete payment to unlock the live classroom URL and meeting passcode.`
                      : 'You are viewing the live class schedule preview as a Registered User. Enroll and complete verified payment to unlock the live joining link and passcode.'}
                  </p>
                </div>
              </div>

              {primary ? (
                <button
                  onClick={() => openCheckout(primary.enrollmentId)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Enroll & Pay Now</span>
                </button>
              ) : (
                previewBatch && (
                  <button
                    disabled={isEnrolling}
                    onClick={() => enrollInBatch(previewBatch._id)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer disabled:opacity-60"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isEnrolling ? 'Reserving...' : 'Enroll & Pay'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* 2. Day 1 & Day 2 Schedule Cards (Always visible as schedule preview) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s: any) => (
            <div
              key={s._id || s.dayNumber}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  Day {s.dayNumber} Session
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {s.sessionDate
                    ? new Date(s.sessionDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                    : `Day ${s.dayNumber}`}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-[#0F172A]">{s.title}</h4>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {s.startTime} – {s.endTime} ({s.timezone})
                </span>
                {isAuthorized && s.liveSessionUrl ? (
                  <a
                    href={s.liveSessionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Join Room</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <Lock className="w-3 h-3" />
                    <span>Link Locked</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 3. Instructor Details Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shrink-0">
            {instructor.name ? instructor.name.charAt(0) : 'V'}
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Lead Instructor
              </span>
            </div>
            <h4 className="text-base font-extrabold text-[#0F172A]">{instructor.name}</h4>
            <p className="text-xs font-semibold text-blue-700">{instructor.role}</p>
            <p className="text-xs text-slate-500 leading-relaxed pt-0.5">{instructor.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
