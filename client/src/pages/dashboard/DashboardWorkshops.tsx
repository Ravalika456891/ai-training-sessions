import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Calendar, Clock, User, Video, ArrowRight, ShieldCheck } from 'lucide-react';
import { useDashboard } from './DashboardLayout';
import { Button } from '../../components/common/Button';

export const DashboardWorkshops: React.FC = () => {
  const { dashboardData } = useDashboard();
  const workshops = dashboardData?.workshops || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            My Enrolled Workshops
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your registered cohorts, review dates, and access curriculum deliverables.
          </p>
        </div>
        <Link to="/#pricing">
          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Enroll in Another Batch
          </Button>
        </Link>
      </div>

      {workshops.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#0F172A]">No Enrolled Workshops</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't reserved a seat in any upcoming cohort yet. All cohorts feature identical live mentorship and materials at ₹1,999.
            </p>
          </div>
          <Link to="/#pricing">
            <Button variant="primary" size="md">
              View Available Batches
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {workshops.map((w: any) => {
            const isConfirmed = w.isAuthorized;
            return (
              <div
                key={w.enrollmentId}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 transition-all hover:border-slate-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {w.workshop?.batchCode || 'AILP-BATCH'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isConfirmed ? 'Confirmed Participant' : 'Payment Pending'}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
                      {w.workshop?.title || 'AI Launchpad — 2-Day Hands-On AI Bootcamp'}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-mono text-slate-500 block">Enrollment ID:</span>
                    <span className="text-xs font-bold text-[#0F172A]">{w.enrollmentId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Cohort Days</span>
                      <span className="font-bold text-[#0F172A]">Saturday & Sunday</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Daily Schedule</span>
                      <span className="font-bold text-[#0F172A]">{w.workshop?.timings || '10:00 AM – 3:00 PM IST'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Lead Instructor</span>
                      <span className="font-bold text-[#0F172A]">{w.workshop?.instructor?.name || 'Vikram Malhotra'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Includes 2 days live mentoring, 4 capstone deliverables, and certificate.</span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Link to="/dashboard/materials">
                      <Button variant="outline" size="sm">
                        View Materials
                      </Button>
                    </Link>
                    <Link to="/dashboard/live-classes">
                      <Button variant="primary" size="sm" rightIcon={<Video className="w-3.5 h-3.5" />}>
                        Classroom Link
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
