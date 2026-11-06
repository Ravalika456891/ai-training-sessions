import React from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { useDashboard } from './DashboardLayout';

export const DashboardLiveClasses: React.FC = () => {
  const { dashboardData, openCheckout } = useDashboard();
  const workshops = dashboardData?.workshops || [];
  const primary = workshops.find((w: any) => w.isAuthorized) || workshops[0];
  const isAuthorized = Boolean(primary?.isAuthorized);
  const sessions = primary?.sessions || [];
  const instructor = primary?.workshop?.instructor || {
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
          View your next scheduled live session, instructor details, and join your interactive virtual classroom.
        </p>
      </div>

      {!primary ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">No Live Classes Scheduled</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Enroll in an upcoming workshop cohort to unlock live interactive mentoring sessions.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Explore Workshops
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Next Class Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0F19] text-white border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-md border border-purple-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Next Live Session • {primary.workshop?.batchCode}</span>
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  {sessions[0]?.title || primary.workshop?.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {primary.sessionAccess?.platform || 'Google Meet / Zoom HD Virtual Classroom'}
                </p>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    isAuthorized
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {isAuthorized ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isAuthorized ? 'Authorized to Join' : 'Payment Required'}</span>
                </span>
              </div>
            </div>

            {/*Join Session Action Box */}
            {isAuthorized ? (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">Virtual Classroom Pass Unlocked</h4>
                  <p className="text-xs text-slate-300">
                    The classroom opens 30 minutes before start time ({primary.workshop?.timings}).
                  </p>
                  <div className="pt-1 text-xs font-mono text-slate-300">
                    Meeting Passcode:{' '}
                    <span className="bg-slate-950 px-2.5 py-0.5 rounded border border-slate-700 font-bold text-purple-300">
                      {primary.sessionAccess?.meetingPasscode || 'AILP2026'}
                    </span>
                  </div>
                </div>

                <a
                  href={primary.sessionAccess?.joinUrl || 'https://meet.google.com/ailp-live-cohort'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer shrink-0"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Session</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-amber-200">Live Session Locked</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Complete your verified enrollment payment to unlock the live classroom link and passcode.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openCheckout(primary.enrollmentId)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-md shrink-0 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Complete Payment</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Day 1 & Day 2 Schedule Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((s: any) => (
              <div
                key={s._id || s.dayNumber}
                className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Day {s.dayNumber} Session
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
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
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    {s.startTime} – {s.endTime} ({s.timezone})
                  </span>
                  {isAuthorized && s.liveSessionUrl && (
                    <a
                      href={s.liveSessionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <span>Join Room</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 3. Instructor Details Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center shrink-0">
              {instructor.name ? instructor.name.charAt(0) : 'V'}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Lead Instructor
                </span>
              </div>
              <h4 className="text-base font-extrabold text-[#0F172A]">{instructor.name}</h4>
              <p className="text-xs font-semibold text-purple-700">{instructor.role}</p>
              <p className="text-xs text-slate-500 leading-relaxed pt-0.5">{instructor.bio}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
