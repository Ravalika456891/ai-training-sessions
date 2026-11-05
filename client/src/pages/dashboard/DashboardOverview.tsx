import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Video,
  Download,
  Upload,
  Award,
  TrendingUp,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard } from './DashboardLayout';
import { Button } from '../../components/common/Button';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const { dashboardData, progress } = useDashboard();

  const workshops = dashboardData?.workshops || [];
  const submissions = dashboardData?.submissions || [];
  const certificates = dashboardData?.certificates || [];

  const primaryWorkshop = workshops[0];
  const isPaidConfirmed = primaryWorkshop?.isAuthorized;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              Welcome back
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Hi, {user?.name || 'Learner'}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Track your bootcamp journey, access live session links, download enterprise prompt starter packs, and submit your capstone project.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link to="/dashboard/live-classes">
            <Button variant="primary" size="md" rightIcon={<Video className="w-4 h-4" />}>
              Live Classroom
            </Button>
          </Link>
          <Link to="/dashboard/materials">
            <Button variant="outline" size="md" rightIcon={<Download className="w-4 h-4" />}>
              Materials
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Cohorts</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A]">{workshops.length}</div>
          <p className="text-[11px] text-slate-500">
            {workshops.length > 0 ? `${workshops.length} cohort registered` : 'No cohorts enrolled'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Project Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A]">{submissions.length}</div>
          <p className="text-[11px] text-slate-500">
            {submissions.length > 0 ? 'Capstone submitted' : 'Pending submission'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Certificates</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F172A]">{certificates.length}</div>
          <p className="text-[11px] text-slate-500">
            {certificates.length > 0 ? 'Verified & Issued' : 'Unlocked after review'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Overall Progress</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600">
            {progress[0]?.percentage || (workshops.length > 0 ? 25 : 0)}%
          </div>
          <p className="text-[11px] text-slate-500">Curriculum completion</p>
        </div>
      </div>

      {/* Main Focus: Live Workshop Status Card */}
      {primaryWorkshop ? (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0F172A]">
                  {primaryWorkshop.workshop?.title || 'AI Launchpad Bootcamp'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Cohort Code: {primaryWorkshop.workshop?.batchCode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                  isPaidConfirmed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isPaidConfirmed ? 'Seat Confirmed' : 'Payment Required'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Schedule</div>
                <div className="font-bold text-[#0F172A]">Saturday & Sunday</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Timings</div>
                <div className="font-bold text-[#0F172A]">{primaryWorkshop.workshop?.timings || '10:00 AM – 3:00 PM IST'}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Mentor</div>
                <div className="font-bold text-[#0F172A]">
                  {primaryWorkshop.workshop?.instructor?.name || 'Lead AI Engineer'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Virtual Classroom Access</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                {isPaidConfirmed
                  ? 'Your classroom seat is unlocked. Links activate 30 minutes before the live weekend session.'
                  : 'Enrollment payment is pending. Complete payment to receive your HD classroom pass.'}
              </p>
            </div>

            {isPaidConfirmed ? (
              <a
                href={primaryWorkshop.sessionAccess?.joinUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Video className="w-4 h-4" />
                <span>Enter Live Classroom</span>
              </a>
            ) : (
              <a
                href="/#pricing"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
              >
                <span>Complete Payment (₹1,999)</span>
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">No Enrolled Workshops Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Select an upcoming 2-Day live cohort to get hands-on mentorship, code templates, and an accredited certificate.
            </p>
          </div>
          <Link to="/#pricing">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Cohorts & Register
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/dashboard/materials"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-600 transition-all shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Download className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-blue-600 transition-colors">
            Learning Materials
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Download 10-prompt enterprise kits, instructions, and React boilerplates.
          </p>
        </Link>

        <Link
          to="/dashboard/assignments"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-600 transition-all shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Upload className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-blue-600 transition-colors">
            Submit Capstone
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Submit your GitHub repository and live application demo for mentor evaluation.
          </p>
        </Link>

        <Link
          to="/dashboard/certificates"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-600 transition-all shadow-xs group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Award className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-[#0F172A] group-hover:text-blue-600 transition-colors">
            Certificates & Badges
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            View, share, and verify your cryptographically signed completion certificate.
          </p>
        </Link>
      </div>
    </div>
  );
};
