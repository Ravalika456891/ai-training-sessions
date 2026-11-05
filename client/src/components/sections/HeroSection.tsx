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
    <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Value Proposition, Action CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-200 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-blue-700 font-bold tracking-wide uppercase text-[11px]">
                {WORKSHOP_CONFIG.edition}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Live Cohort Enrollment Active</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0F172A] leading-[1.15]">
                Master Practical AI in{' '}
                <span className="block mt-1 text-blue-600">
                  Just One Weekend
                </span>
              </h1>
            </div>

            {/* Subtitle / Description */}
            <p className="text-base sm:text-lg text-[#475569] leading-relaxed font-normal max-w-2xl">
              Stop watching passive video tutorials. Build custom enterprise AI assistants, autonomous agent workflows, and functional web app prototypes with senior practitioners. <strong className="text-[#0F172A] font-semibold">100% hands-on exercises</strong> with zero filler slides.
            </p>

            {/* Value Highlights (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-3 max-w-xl pt-1">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Sat & Sun</div>
                  <div className="text-[11px] text-[#475569]">10 AM – 3 PM IST</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">10 Hours Live</div>
                  <div className="text-[11px] text-[#475569]">Live interactive coding</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <Terminal className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">6 Portfolio Labs</div>
                  <div className="text-[11px] text-[#475569]">Real production code</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Verifiable Cert</div>
                  <div className="text-[11px] text-[#475569]">Unique verifiable ID</div>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={onRegisterClick}
                className="text-base px-8 py-3.5"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Register for Next Batch
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onExploreCurriculum}
                className="text-base px-6 py-3.5"
              >
                Explore 2-Day Curriculum
              </Button>
            </div>

            {/* Trust and Proof Strip */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-[#475569]">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600 border border-white flex items-center justify-center text-[10px] text-white font-bold">AK</div>
                  <div className="w-6 h-6 rounded-full bg-blue-700 border border-white flex items-center justify-center text-[10px] text-white font-bold">PS</div>
                  <div className="w-6 h-6 rounded-full bg-blue-800 border border-white flex items-center justify-center text-[10px] text-white font-bold">RM</div>
                </div>
                <div className="flex items-center gap-1 text-[#0F172A] font-medium">
                  <Star className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                  <span>4.9/5 from 1,400+ Learners</span>
                </div>
              </div>
              <span className="hidden sm:inline text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-[#475569]">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>100% Risk-Free Guarantee</span>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Solid Cohort Pass Card */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 text-left relative shadow-lg">
              
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-[11px] font-mono text-slate-500 ml-2">cohort-pass.live</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Enrollment Active
                </span>
              </div>

              {/* Batch Date & Timings */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Upcoming Cohort
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {currentBatch.batchCode}
                  </span>
                </div>
                <div className="text-lg font-extrabold text-[#0F172A]">
                  {currentBatch.dateRange}
                </div>
                <div className="text-xs text-[#475569] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{currentBatch.timings} ({currentBatch.timezone})</span>
                </div>
              </div>

              {/* Real-Time Seat Capacity Indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#475569] font-medium flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    Live Cohort Capacity
                  </span>
                  <span className="text-blue-700 font-bold">
                    {currentBatch.availableSeats} of {currentBatch.totalSeats} seats open
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(15, fillPercentage))}%` }}
                  />
                </div>
              </div>

              {/* Live Portfolio Deliverables */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  Hands-On Projects Built:
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[#0F172A]">
                    <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Enterprise RAG Knowledge System (LangChain)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[#0F172A]">
                    <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Autonomous Multi-Agent Researcher (n8n + Claude)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[#0F172A]">
                    <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Full-Stack AI Web Application Prototype</span>
                  </div>
                </div>
              </div>

              {/* Price & Fast Enroll Action */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-[#475569]">Total All-Inclusive Fee</div>
                  <div className="text-2xl font-black text-[#0F172A]">
                    ₹{currentBatch.pricing.basePrice.toLocaleString('en-IN')}
                    <span className="text-[11px] font-normal text-[#475569] ml-1">+ GST</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={onRegisterClick}
                  className="py-2.5 px-5"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Claim Seat
                </Button>
              </div>

              {/* Free Bonus Vault Pill */}
              <div className="text-center pt-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-medium">
                  <Sparkles className="w-3 h-3 text-blue-600" />
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
