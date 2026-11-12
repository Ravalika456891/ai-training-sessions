import React from 'react';
import { CheckCircle2, Circle, Award, Calendar, Upload, Video } from 'lucide-react';
import { useDashboard } from './DashboardLayout';

export const DashboardProgress: React.FC = () => {
  const { progress, dashboardData } = useDashboard();
  const currentProgress = progress[0];
  const workshops = dashboardData?.workshops || [];
  const primary = workshops[0];

  const percentage = currentProgress?.percentage ?? (primary?.isAuthorized ? 25 : 0);

  const milestones = [
    {
      title: 'Cohort Seat Registration',
      description: 'Reserved upcoming batch seat and completed onboarding credentials.',
      isDone: Boolean(primary),
      icon: Calendar,
    },
    {
      title: 'Day 1 Live Session Attendance',
      description: 'Mastered prompt engineering, vision models, and structured function calling.',
      isDone: Boolean(currentProgress?.day1Attended),
      icon: Video,
    },
    {
      title: 'Day 2 Live Session Attendance',
      description: 'Architected custom autonomous agents and automated lead routing workflows.',
      isDone: Boolean(currentProgress?.day2Attended),
      icon: Video,
    },
    {
      title: 'Capstone Project Deliverable Submission',
      description: 'Submitted working GitHub repository and deployed interactive AI demo.',
      isDone: Boolean(currentProgress?.projectSubmitted || (dashboardData?.submissions?.length > 0)),
      icon: Upload,
    },
    {
      title: 'Cryptographic Certificate Issuance',
      description: 'Passed mentor evaluation and unlocked verified AI Launchpad certificate.',
      isDone: Boolean(currentProgress?.certificateEarned || (dashboardData?.certificates?.length > 0)),
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Learning Journey & Attendance Progress
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track milestone completions, attendance verification, and progress towards your accredited certificate.
        </p>
      </div>

      {/* Main Progress Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#1F386B] uppercase tracking-wider">
              {primary?.workshop?.batchCode || 'Bootcamp Cohort'}
            </span>
            <h3 className="text-lg font-bold text-[#0F172A]">Overall Bootcamp Completion</h3>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-3xl font-black text-[#1F386B]">{percentage}%</span>
            <span className="text-xs text-slate-400 block font-medium">Completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200">
          <div
            className="bg-[#1F386B] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(percentage, 5)}%` }}
          />
        </div>

        {/* 2-Day Attendance Markers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Attendance Status</span>
              <span className="text-sm font-bold text-[#0F172A]">Day 1: Foundations & Vision</span>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                currentProgress?.day1Attended
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {currentProgress?.day1Attended ? 'Present' : 'Upcoming / Pending'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Attendance Status</span>
              <span className="text-sm font-bold text-[#0F172A]">Day 2: Agents & Deployment</span>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                currentProgress?.day2Attended
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {currentProgress?.day2Attended ? 'Present' : 'Upcoming / Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Milestone Checklist */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] pb-3 border-b border-slate-100">
          Bootcamp Milestone Checklist
        </h3>

        <div className="space-y-4">
          {milestones.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  m.isDone
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/60 border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    m.isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {m.isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-bold flex items-center gap-1.5 ${
                        m.isDone ? 'text-[#0F172A]' : 'text-slate-600'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{m.title}</span>
                    </h4>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        m.isDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {m.isDone ? 'Completed' : 'Step ' + (idx + 1)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{m.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
