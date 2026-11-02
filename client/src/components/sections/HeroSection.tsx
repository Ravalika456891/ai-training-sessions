import React from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Users,
  Award,
  Terminal,
  Sparkles,
  Zap,
  Code2,
  Cpu,
  Layers,
  Star
} from 'lucide-react';
import { Button } from '../common/Button';
import { WORKSHOP_CONFIG, BATCH_OPTIONS } from '../../data/workshopData';
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
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-brand-violet/25 via-indigo-600/15 to-brand-cyan/20 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-36 right-4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-[110px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Value Proposition, Action CTAs */}
          <div className="lg:col-span-7 space-y-7 text-left">
            
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-violet/15 via-indigo-900/30 to-brand-cyan/15 border border-indigo-500/30 text-xs font-semibold text-slate-200 shadow-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-brand-cyan font-bold tracking-wide uppercase text-[11px]">
                {WORKSHOP_CONFIG.edition}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">Live Cohort Enrollment Active</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Master Practical AI in{' '}
                <span className="block mt-1 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 filter drop-shadow-sm">
                  Just One Weekend
                </span>
              </h1>
            </div>

            {/* Subtitle / Description */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
              Stop watching passive video tutorials. Build custom enterprise AI assistants, autonomous agent workflows, and functional web app prototypes with senior practitioners. <strong className="text-white font-semibold">100% hands-on exercises</strong> with zero filler slides.
            </p>

            {/* Value Highlights (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-3 max-w-xl pt-1">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-navy-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-brand-cyan" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sat & Sun</div>
                  <div className="text-[11px] text-slate-400">10 AM – 3 PM IST</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-navy-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">10 Hours Live</div>
                  <div className="text-[11px] text-slate-400">Live interactive coding</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-navy-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">6 Portfolio Labs</div>
                  <div className="text-[11px] text-slate-400">Real production code</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-navy-900/60 border border-slate-800/80 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Verifiable Cert</div>
                  <div className="text-[11px] text-slate-400">Unique verifiable ID</div>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Button
                variant="gradient"
                size="lg"
                onClick={onRegisterClick}
                className="text-base px-8 py-4 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Register for Next Batch
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onExploreCurriculum}
                className="text-base px-6 py-4 border-slate-700 bg-navy-900/60 hover:bg-white/5 hover:border-slate-500"
              >
                Explore 2-Day Curriculum
              </Button>
            </div>

            {/* Trust and Proof Strip */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-violet-600 border border-navy-950 flex items-center justify-center text-[10px] text-white font-bold">AK</div>
                  <div className="w-6 h-6 rounded-full bg-cyan-600 border border-navy-950 flex items-center justify-center text-[10px] text-white font-bold">PS</div>
                  <div className="w-6 h-6 rounded-full bg-indigo-600 border border-navy-950 flex items-center justify-center text-[10px] text-white font-bold">RM</div>
                </div>
                <div className="flex items-center gap-1 text-slate-300 font-medium">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>4.9/5 from 1,400+ Learners</span>
                </div>
              </div>
              <span className="hidden sm:inline text-slate-700">•</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Risk-Free Guarantee</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Live Cohort Pass & Tech Card */}
          <div className="lg:col-span-5 relative">
            
            {/* Ambient Card Backlight */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-cyan-500/30 rounded-3xl blur-2xl -z-10 transform scale-95 opacity-60" />

            {/* Main Terminal Pass Container */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-[#0B132B]/95 via-[#070D1E]/95 to-[#050814]/98 backdrop-blur-xl p-5 sm:p-6 shadow-2xl space-y-5 text-left relative overflow-hidden">
              
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-slate-400 ml-2">cohort-pass.live</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Enrollment Active
                </span>
              </div>

              {/* Batch Date & Timings */}
              <div className="bg-navy-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider">
                    Upcoming Cohort
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {currentBatch.batchCode}
                  </span>
                </div>
                <div className="text-lg font-extrabold text-white">
                  {currentBatch.dateRange}
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-violet" />
                  <span>{currentBatch.timings} ({currentBatch.timezone})</span>
                </div>
              </div>

              {/* Real-Time Seat Capacity Indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Live Cohort Capacity
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {currentBatch.availableSeats} of {currentBatch.totalSeats} seats open
                  </span>
                </div>
                <div className="w-full bg-navy-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-brand-violet via-indigo-500 to-brand-cyan h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(15, fillPercentage))}%` }}
                  />
                </div>
              </div>

              {/* Live Portfolio Deliverables */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Hands-On Projects Built:
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-navy-950/60 border border-slate-800/80 text-slate-200">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">Enterprise RAG Knowledge System (LangChain)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-navy-950/60 border border-slate-800/80 text-slate-200">
                    <Code2 className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                    <span className="truncate">Autonomous Multi-Agent Researcher (n8n + Claude)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-navy-950/60 border border-slate-800/80 text-slate-200">
                    <Layers className="w-3.5 h-3.5 text-brand-violet shrink-0" />
                    <span className="truncate">Full-Stack AI Web Application Prototype</span>
                  </div>
                </div>
              </div>

              {/* Price & Fast Enroll Action */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-400">Total All-Inclusive Fee</div>
                  <div className="text-2xl font-black text-white">
                    ₹{currentBatch.pricing.basePrice.toLocaleString('en-IN')}
                    <span className="text-[11px] font-normal text-slate-400 ml-1">+ GST</span>
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="md"
                  onClick={onRegisterClick}
                  className="py-2.5 px-5 shadow-lg shadow-indigo-600/30"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Claim Seat
                </Button>
              </div>

              {/* Free Bonus Vault Pill */}
              <div className="text-center pt-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-medium">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Includes 40+ Production AI Prompt Templates Free
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
