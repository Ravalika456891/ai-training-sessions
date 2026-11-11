import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowRight,
  Award,
  Terminal,
  Sparkles,
  LayoutDashboard,
  BookOpen,
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

  return (
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 light-hero-backdrop text-[#0F172A] overflow-hidden border-b border-slate-200/80">
      {/* Subtle Top & Side Glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[28rem] h-[28rem] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute top-12 right-10 w-[24rem] h-[24rem] rounded-full bg-indigo-100/50 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-Column Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Crisp Typography, 2x2 Feature Grid & Clear CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* 1. Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200 text-xs font-bold text-blue-700 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-[#0F172A]">2-Day Hands-On AI Bootcamp</span>
              <span className="text-blue-300">•</span>
              <span className="text-blue-700">Live Mentorship</span>
            </div>

            {/* 2. Executive Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight text-[#0F172A] leading-[1.12]">
              Master Practical AI &amp; Build Real Workflows in{' '}
              <span className="text-blue-600">
                One Weekend
              </span>
            </h1>

            {/* 3. Clean Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Go from zero AI background to building custom AI assistants, multi-step automations, and functional web prototypes with live step-by-step mentorship.
            </p>

            {/* 4. Balanced 2x2 Key Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto lg:mx-0 pt-1">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-[#0F172A]">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Saturday &amp; Sunday Live</span>
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-[#0F172A]">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span>10 Hours of Guided Labs</span>
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-[#0F172A]">
                <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Terminal className="w-4 h-4" />
                </div>
                <span>No Coding Required</span>
              </div>

              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-[#0F172A]">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <span>Verified Certificate</span>
              </div>
            </div>

            {/* 5. Clean Primary & Secondary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onRegisterClick}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreCurriculum}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0F172A] text-sm font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Explore Curriculum</span>
              </button>

              <Link
                to="/signin"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-[#0F172A] text-sm font-bold shadow-2xs transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Minimal, Clean Cohort Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden max-w-lg mx-auto lg:ml-auto">
              {/* Minimal Top Bar */}
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-bold text-slate-700">
                    Next Live Cohort
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {currentBatch.availableSeats} Seats Open
                </span>
              </div>

              {/* Clean Visual + Essential Info Only */}
              <div className="p-5 sm:p-6 space-y-5">
                <div className="group relative rounded-2xl overflow-hidden aspect-[16/9] bg-[#081E4A] border border-slate-200 shadow-inner">
                  <img
                    src="/assets/hero-cohort-showcase.jpg"
                    alt="AI Launchpad Live Bootcamp"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-600 text-white mb-1">
                        Batch {currentBatch.batchCode}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold">
                        {currentBatch.dateRange}
                      </h3>
                      <p className="text-xs text-slate-200">
                        {currentBatch.timings} • Led by Vikram Malhotra
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compact Bottom Bar */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Full 2-Day Pass
                    </div>
                    <div className="text-2xl font-black text-[#0F172A]">
                      ₹{currentBatch.pricing.basePrice.toLocaleString('en-IN')}
                      <span className="text-xs font-semibold text-slate-500 ml-1">
                        + GST
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onRegisterClick}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer transition-all"
                  >
                    <span>Reserve Seat</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
