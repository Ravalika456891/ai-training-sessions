import React from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  Award,
  Terminal,
  Zap,
  Code2,
  Layers,
  CheckCircle2,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { BATCH_OPTIONS } from '../../data/workshopData';
import type { BatchOption } from '../../types/workshop';

interface HeroSectionProps {
  onRegisterClick: () => void;
  onExploreCurriculum: () => void;
  batch?: BatchOption;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onRegisterClick,
  onExploreCurriculum,
  batch,
}) => {
  const currentBatch = batch || BATCH_OPTIONS[0];
  const seatsClaimed = currentBatch.totalSeats - currentBatch.availableSeats;
  const fillPercentage = Math.round((seatsClaimed / currentBatch.totalSeats) * 100);

  return (
    <section className="relative pt-14 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-blue-50/60 via-white to-[#F8FAFC] text-[#0F172A] overflow-hidden border-b border-slate-200/70">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-7">
          {/* 1. Status Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-blue-200 shadow-xs text-xs font-semibold text-blue-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[#0F172A] font-bold">2-Day Hands-On AI Bootcamp</span>
            <span className="text-slate-300">•</span>
            <span className="text-blue-600 font-medium">Beginner-Friendly Live Training</span>
          </div>

          {/* 2. Clear AI Training Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0F172A] leading-[1.12]">
            Master Practical AI & Build Real Workflows in{' '}
            <span className="text-blue-600">One Weekend</span>
          </h1>

          {/* 3. Clear Subtitle Description */}
          <p className="text-base sm:text-lg md:text-xl text-[#475569] leading-relaxed max-w-2xl mx-auto font-normal">
            Go from zero AI background to building custom AI assistants, multi-step automations, and functional web prototypes with live step-by-step mentorship.
          </p>

          {/* 4. Four Key Workshop Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 max-w-3xl mx-auto pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-semibold text-[#0F172A]">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Saturday & Sunday (Live)</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-semibold text-[#0F172A]">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>10 Hours of Guided Labs</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-semibold text-[#0F172A]">
              <Terminal className="w-4 h-4 text-blue-600 shrink-0" />
              <span>No Coding Experience Required</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-semibold text-[#0F172A]">
              <Award className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Verified Certificate</span>
            </div>
          </div>

          {/* 5. Primary and Secondary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onRegisterClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-base px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <span>Register Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onExploreCurriculum}
              className="w-full sm:w-auto inline-flex items-center justify-center text-base px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0F172A] font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Explore 2-Day Curriculum
            </button>
          </div>

          {/* 6. Trust Proof Points */}
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 pt-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>100% Refund Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Slides, Notes & Prompt Templates Included</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Explore Freely Without an Account</span>
            </div>
          </div>
        </div>

        {/* 7. Live Cohort Overview Card */}
        <div className="mt-14 max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Upcoming Batch Info */}
            <div className="md:col-span-5 space-y-2.5 border-b md:border-b-0 md:border-r border-slate-200 pb-5 md:pb-0 md:pr-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  Upcoming Batch
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {currentBatch.batchCode}
                </span>
              </div>
              <div className="text-lg font-black text-[#0F172A]">{currentBatch.dateRange}</div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentBatch.timings}</span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Seat Availability</span>
                  <span className="text-blue-600 font-bold">
                    {currentBatch.availableSeats} of {currentBatch.totalSeats} seats open
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(15, fillPercentage))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Middle: Deliverables Built */}
            <div className="md:col-span-4 space-y-2.5">
              <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>What You Will Build Live:</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0F172A]">
                  <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate font-medium">Day 1: Custom AI Assistant & Prompt Library</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0F172A]">
                  <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate font-medium">Day 2: Automated Multi-Step AI Workflow</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[#0F172A]">
                  <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate font-medium">Capstone: Deployed AI Web Prototype</span>
                </div>
              </div>
            </div>

            {/* Right: Price & Quick Action */}
            <div className="md:col-span-3 flex flex-col justify-center items-start md:items-end gap-2.5 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
              <div>
                <div className="text-[11px] text-slate-500">Transparent Tuition</div>
                <div className="text-2xl font-black text-[#0F172A]">
                  ₹{currentBatch.pricing.basePrice.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500">+ 18% GST • Full Weekend</div>
              </div>
              <button
                onClick={onRegisterClick}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <span>Reserve Seat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
