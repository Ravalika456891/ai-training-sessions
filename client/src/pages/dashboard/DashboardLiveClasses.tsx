import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Lock, AlertCircle, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDashboard } from './DashboardLayout';
import { Button } from '../../components/common/Button';

export const DashboardLiveClasses: React.FC = () => {
  const { dashboardData } = useDashboard();
  const workshops = dashboardData?.workshops || [];
  const primary = workshops[0];
  const isAuthorized = primary?.isAuthorized;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Live Interactive Virtual Classroom
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Access your high-definition interactive mentoring session with screen sharing, breakout rooms, and live Q&A.
        </p>
      </div>

      {!primary ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">No Live Classrooms Scheduled</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You must register for an upcoming cohort to receive your private classroom access credentials.
            </p>
          </div>
          <Link to="/#pricing">
            <Button variant="primary" size="md">
              Select Batch & Enroll
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Virtual Classroom Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {primary.sessionAccess?.platform || 'Google Meet / Zoom HD Virtual Classroom'}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
                  {primary.workshop?.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Batch: <span className="font-mono font-semibold text-[#0F172A]">{primary.workshop?.batchCode}</span>
                </p>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    isAuthorized
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isAuthorized ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
                  <span>{isAuthorized ? 'Access Unlocked' : 'Payment Required'}</span>
                </span>
              </div>
            </div>

            {/* Session Schedule Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Dates</span>
                <div className="font-bold text-[#0F172A] text-sm">Saturday & Sunday</div>
                <div className="text-[11px] text-slate-500">2-Day Intensive Weekend</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Class Hours</span>
                <div className="font-bold text-[#0F172A] text-sm">{primary.workshop?.timings || '10:00 AM – 3:00 PM IST'}</div>
                <div className="text-[11px] text-slate-500">{primary.workshop?.timezone || 'Asia/Kolkata (IST)'}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Instructor</span>
                <div className="font-bold text-[#0F172A] text-sm">{primary.workshop?.instructor?.name || 'Vikram Malhotra'}</div>
                <div className="text-[11px] text-slate-500">Live Hands-on Coding</div>
              </div>
            </div>

            {/* Credentials / Gated Action Box */}
            {isAuthorized ? (
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#0F172A] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Classroom Meeting Link Ready</span>
                    </h4>
                    <p className="text-xs text-slate-600">
                      Join using your registered email address. The room opens 30 minutes prior to Day 1 start time.
                    </p>
                    <div className="mt-2 text-xs font-mono text-[#0F172A]">
                      Meeting Passcode:{' '}
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-blue-600">
                        {primary.sessionAccess?.meetingPasscode || 'AILP2026'}
                      </span>
                    </div>
                  </div>

                  <a
                    href={primary.sessionAccess?.joinUrl || 'https://meet.google.com/ailp-live-cohort'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Live Virtual Room</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-amber-900">Live Classroom Locked</h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Your seat is registered but requires completed payment to unlock your private Google Meet/Zoom link.
                    </p>
                  </div>
                </div>
                <div className="pt-2">
                  <a
                    href="/#pricing"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Complete Payment to Unlock (₹1,999)
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Guidelines Box */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-[#0F172A] text-sm">Classroom Guidelines & Etiquette</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>Keep your webcam enabled during interactive breakout mentoring sessions.</li>
              <li>Please keep your microphone muted when the instructor is presenting.</li>
              <li>Use the live chat room for posting prompt experiments and receiving real-time code reviews.</li>
              <li>High-definition class recordings are published within 3 hours after each day's conclusion.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
