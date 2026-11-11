import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Clock,
  User,
  Video,
  ArrowRight,
  BookOpen,
  CreditCard,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useDashboard } from './DashboardLayout';

export const DashboardWorkshops: React.FC = () => {
  const { dashboardData, isEnrolling, enrollInBatch, openCheckout } = useDashboard();
  const workshops = dashboardData?.workshops || [];
  const availableWorkshops = dashboardData?.availableWorkshops || [];

  const enrolledBatchCodes = new Set(workshops.map((w: any) => w.workshop?.batchCode));
  const otherBatches = availableWorkshops.filter(
    (b: any) => !enrolledBatchCodes.has(b.batchCode)
  );

  const [selectedEnrolledId, setSelectedEnrolledId] = useState<string | null>(null);
  const [selectedOtherBatchId, setSelectedOtherBatchId] = useState<string | null>(null);

  const displayedWorkshops =
    selectedEnrolledId && selectedEnrolledId !== 'all'
      ? workshops.filter((w: any) => w.enrollmentId === selectedEnrolledId || w.workshop?._id === selectedEnrolledId)
      : workshops;

  const displayedOtherBatch =
    (selectedOtherBatchId
      ? otherBatches.find((b: any) => b._id === selectedOtherBatchId)
      : null) || otherBatches[0];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          My Workshops
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          View your enrolled workshop cohorts, Day 1 & Day 2 curriculum schedule, and enrollment status.
        </p>
      </div>

      {/* Enrolled Workshops Section */}
      {workshops.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#0F172A]">No Workshops Enrolled Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Select an available weekend cohort below to reserve your seat and unlock your student learning modules.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* If enrolled in multiple workshops, provide session selector tabs */}
          {workshops.length > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Filter Enrolled Session:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                {workshops.map((w: any) => {
                  const isSelected = selectedEnrolledId === w.enrollmentId;
                  return (
                    <button
                      key={w.enrollmentId}
                      type="button"
                      onClick={() => setSelectedEnrolledId(w.enrollmentId)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-[#0F172A]'
                      }`}
                    >
                      {w.workshop?.batchCode || w.enrollmentId}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedEnrolledId('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedEnrolledId === 'all' || !selectedEnrolledId
                      ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  View All ({workshops.length})
                </button>
              </div>
            </div>
          )}

          {displayedWorkshops.map((w: any) => {
            const isConfirmed = w.isAuthorized;
            const sessions = w.sessions || [];

            return (
              <div
                key={w.enrollmentId}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5"
              >
                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                        {w.workshop?.batchCode || 'AILP-BATCH'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isConfirmed ? 'Confirmed Enrollment' : 'Payment Pending'}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-[#0F172A]">
                      {w.workshop?.title || 'AI Launchpad — 2-Day Hands-On AI Bootcamp'}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Enrollment ID
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0F172A]">
                      {w.enrollmentId}
                    </span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                        Dates
                      </span>
                      <span className="font-bold text-[#0F172A]">
                        {new Date(w.workshop?.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        –{' '}
                        {new Date(w.workshop?.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                        Schedule
                      </span>
                      <span className="font-bold text-[#0F172A]">
                        {w.workshop?.timings || '10:00 AM – 3:00 PM IST'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <User className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                        Instructor
                      </span>
                      <span className="font-bold text-[#0F172A]">
                        {w.workshop?.instructor?.name || 'Vikram Malhotra'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Day 1 & Day 2 Curriculum & Schedule */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Curriculum & Session Schedule</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sessions.map((s: any) => (
                      <div
                        key={s._id || s.dayNumber}
                        className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-600">Day {s.dayNumber}</span>
                          <span className="text-[11px] text-slate-500">
                            {s.startTime} – {s.endTime}
                          </span>
                        </div>
                        <p className="font-bold text-[#0F172A]">{s.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {isConfirmed
                        ? 'Full access to live classroom, slides, prompt templates, and certification.'
                        : 'Complete payment to activate your classroom link and learning materials.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {isConfirmed ? (
                      <>
                        <Link
                          to="/dashboard/materials"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Materials</span>
                        </Link>
                        <Link
                          to="/dashboard/live-classes"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Live Class</span>
                        </Link>
                      </>
                    ) : (
                      <button
                        onClick={() => openCheckout(w.enrollmentId)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Complete Payment</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Workshop Cohort for Exploration & Curriculum Preview (Based on selection, only 1 selected session is visible) */}
      {workshops.length === 0 && otherBatches.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Upcoming Workshop Cohort & Curriculum Preview
              </h3>
              <p className="text-xs text-slate-500">
                Preview the full Day 1 & Day 2 curriculum and schedule below. Click "Enroll & Pay" to reserve your confirmed seat.
              </p>
            </div>

            {/* If multiple available batches exist, provide selection tabs */}
            {otherBatches.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                {otherBatches.map((b: any) => {
                  const isSelected =
                    (selectedOtherBatchId && selectedOtherBatchId === b._id) ||
                    (!selectedOtherBatchId && otherBatches[0]?._id === b._id);
                  return (
                    <button
                      key={b._id}
                      type="button"
                      onClick={() => setSelectedOtherBatchId(b._id)}
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

          <div className="grid grid-cols-1 w-full gap-5">
            {[displayedOtherBatch].filter(Boolean).map((batch: any) => {
              const basePrice = batch.price?.basePrice ?? 1999;
              const previewSessions = batch.sessionsPreview || [];
              return (
                <div
                  key={batch._id}
                  className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                        {batch.batchCode}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {batch.availableSeats} seats open
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#0F172A]">{batch.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{batch.description}</p>
                    </div>
                    <p className="text-xs font-semibold text-[#0F172A] flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>
                        {new Date(batch.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        –{' '}
                        {new Date(batch.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        • {batch.timings}
                      </span>
                    </p>

                    {/* Day 1 & Day 2 Curriculum Preview */}
                    {previewSessions.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Curriculum Preview
                        </span>
                        {previewSessions.map((ps: any) => (
                          <div
                            key={ps._id || ps.dayNumber}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-start gap-2"
                          >
                            <span className="font-bold text-blue-600 shrink-0">
                              Day {ps.dayNumber}:
                            </span>
                            <span className="text-[#0F172A] font-medium">{ps.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Tuition Fee
                      </span>
                      <span className="text-base font-black text-[#0F172A]">
                        ₹{basePrice.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] font-normal text-slate-500">+ 18% GST</span>
                      </span>
                    </div>
                    <button
                      disabled={isEnrolling}
                      onClick={() => enrollInBatch(batch._id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Enroll & Pay</span>
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
};
