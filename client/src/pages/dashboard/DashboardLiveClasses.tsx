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
  Download,
  Ban,
  RefreshCw,
} from 'lucide-react';
import { useDashboard } from './DashboardLayout';

function buildStudentIcs(session: any, batchCode: string): string {
  const startIso = session.startAt || session.sessionDate || new Date().toISOString();
  const dur = Number(session.durationMinutes) || 120;
  const endIso =
    session.endAt || new Date(new Date(startIso).getTime() + dur * 60000).toISOString();

  const toIcsUtc = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');

  const uid = `${session._id || session.dayNumber}@ailaunchpad.edu`;
  const statusLine = session.status === 'cancelled' ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED';
  const desc = `${session.description || session.title}\\nBatch: ${batchCode}\\nInstructor: ${
    session.instructorName || 'Vikram Malhotra'
  }${session.liveSessionUrl ? `\\nJoin Link: ${session.liveSessionUrl}` : ''}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Launchpad//Student Live Classes//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtc(new Date().toISOString())}`,
    `DTSTART:${toIcsUtc(startIso)}`,
    `DTEND:${toIcsUtc(endIso)}`,
    `SUMMARY:${session.title} (${batchCode})`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${session.liveSessionUrl || 'AI Launchpad Live Classroom'}`,
    statusLine,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function buildGoogleCalendarUrl(session: any, batchCode: string): string {
  const startIso = session.startAt || session.sessionDate || new Date().toISOString();
  const dur = Number(session.durationMinutes) || 120;
  const endIso =
    session.endAt || new Date(new Date(startIso).getTime() + dur * 60000).toISOString();

  const fmt = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${session.title} (${batchCode})`,
    dates: `${fmt(startIso)}/${fmt(endIso)}`,
    details: `${session.description || session.title}\nInstructor: ${
      session.instructorName || 'Vikram Malhotra'
    }${session.liveSessionUrl ? `\nJoin Class: ${session.liveSessionUrl}` : ''}`,
    location: session.liveSessionUrl || 'Online Live Classroom',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const DashboardLiveClasses: React.FC = () => {
  const { dashboardData, isEnrolling, enrollInBatch, openCheckout } = useDashboard();
  const workshops = dashboardData?.workshops || [];
  const availableWorkshops = dashboardData?.availableWorkshops || [];

  const primary = workshops.find((w: any) => w.isAuthorized) || workshops[0] || null;
  const previewBatch = availableWorkshops[0] || null;
  const isAuthorized = Boolean(primary?.isAuthorized);

  const activeWorkshopInfo = primary?.workshop || previewBatch;
  const batchCode = activeWorkshopInfo?.batchCode || 'AILP-2026-NOV-14';
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
        status: 'scheduled',
      },
      {
        _id: 'preview-day2',
        dayNumber: 2,
        title: 'Day 2: Multi-Step AI Workflows, Functional Prototyping & Capstone Lab',
        startTime: '10:00 AM',
        endTime: '3:00 PM',
        timezone: 'Asia/Kolkata (IST)',
        status: 'scheduled',
      },
    ];

  const nextActiveSession =
    sessions.find((s: any) => s.status !== 'cancelled' && s.status !== 'completed') || sessions[0];

  const instructor = activeWorkshopInfo?.instructor || {
    name: 'Vikram Malhotra',
    role: 'Staff AI Engineer & Former ML Lead',
    bio: 'Over 12 years building production software and leading enterprise LLM integrations.',
  };

  const handleDownloadIcs = (session: any) => {
    const ics = buildStudentIcs(session, batchCode);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${batchCode}-${(session.title || 'session')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Live Classes & Cohort Calendar
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {isAuthorized
            ? 'Access your authorized live session links, meeting passcodes, calendar invites (.ics), and real-time schedule updates.'
            : 'Preview the upcoming live interactive class schedule and instructor details. Protected joining links unlock after verified payment.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Next Class Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white text-[#0F172A] border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {isAuthorized ? 'Next Live Session' : 'Live Schedule Preview'} • {batchCode}
                </span>
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
                {nextActiveSession?.title || activeWorkshopInfo?.title || 'AI Launchpad Live Bootcamp'}
              </h3>
              <p className="text-xs text-slate-500">
                {primary?.sessionAccess?.platform || 'Google Meet / Zoom HD Virtual Classroom'} •{' '}
                {nextActiveSession?.startTime || '10:00 AM'} – {nextActiveSession?.endTime || '3:00 PM'} (
                {nextActiveSession?.timezone || 'Asia/Kolkata'})
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
                  The classroom opens 30 minutes before start time ({nextActiveSession?.startTime} –{' '}
                  {nextActiveSession?.endTime}).
                </p>
                <div className="pt-1 text-xs font-mono text-slate-600">
                  Meeting Passcode:{' '}
                  <span className="bg-white px-2.5 py-0.5 rounded border border-blue-200 font-bold text-blue-700">
                    {nextActiveSession?.meetingPasscode ||
                      primary?.sessionAccess?.meetingPasscode ||
                      'AILP2026'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {nextActiveSession && (
                  <button
                    type="button"
                    onClick={() => handleDownloadIcs(nextActiveSession)}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Add to Calendar (.ics)</span>
                  </button>
                )}
                <a
                  href={
                    nextActiveSession?.liveSessionUrl ||
                    primary?.sessionAccess?.joinUrl ||
                    'https://meet.google.com/ailp-live-cohort'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Session</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
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

        {/* 2. All Scheduled Calendar Sessions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s: any, idx: number) => {
            const isCancelled = s.status === 'cancelled';
            const isLive = s.status === 'live';
            const isCompleted = s.status === 'completed';
            const wasRescheduled = Boolean(s.wasRescheduled);

            return (
              <div
                key={s._id || `${s.dayNumber}-${idx}`}
                className={`p-5 rounded-3xl bg-white border shadow-xs space-y-3 ${
                  isCancelled ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      Session {s.dayNumber || idx + 1}
                    </span>

                    {isCancelled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                        <Ban className="w-3 h-3" />
                        Cancelled
                      </span>
                    ) : isLive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Live Now
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Scheduled
                      </span>
                    )}

                    {wasRescheduled && !isCancelled && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        <RefreshCw className="w-3 h-3" />
                        Rescheduled
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {s.startAt || s.sessionDate
                      ? new Date(s.startAt || s.sessionDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : `Day ${s.dayNumber || idx + 1}`}
                  </span>
                </div>

                <h4
                  className={`font-extrabold text-sm text-[#0F172A] ${
                    isCancelled ? 'line-through opacity-70' : ''
                  }`}
                >
                  {s.title}
                </h4>

                {s.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
                )}

                {isCancelled && s.cancellationReason && (
                  <p className="text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                    Cancelled: {s.cancellationReason}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {s.startTime} – {s.endTime} ({s.timezone})
                  </span>

                  <div className="flex items-center gap-2">
                    {isAuthorized && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDownloadIcs(s)}
                          title="Download .ics calendar invitation"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>.ICS</span>
                        </button>
                        {!isCancelled && (
                          <a
                            href={buildGoogleCalendarUrl(s, batchCode)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600"
                          >
                            <span>GCal</span>
                          </a>
                        )}
                      </>
                    )}

                    {isCancelled ? (
                      <span className="text-[11px] font-bold text-rose-600">Session Cancelled</span>
                    ) : isAuthorized && s.liveSessionUrl ? (
                      <a
                        href={s.liveSessionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Join Class</span>
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
              </div>
            );
          })}
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
