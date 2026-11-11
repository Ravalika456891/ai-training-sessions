import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  ArrowRight,
  Award,
  Terminal,
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Users,
} from 'lucide-react';
import { Button } from '../common/Button';
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
  const pillars = [
    { icon: Calendar, label: 'Saturday & Sunday Live', tint: 'bg-blue-50 text-[#081e4a] border-[#081e4a]/20' },
    { icon: Clock, label: '10 Hours of Guided Labs', tint: 'bg-blue-50 text-[#081e4a] border-[#081e4a]/20' },
    { icon: Terminal, label: 'No Coding Required', tint: 'bg-blue-50 text-[#081e4a] border-[#081e4a]/20' },
    { icon: Award, label: 'Verified Certificate', tint: 'bg-blue-50 text-[#081e4a] border-[#081e4a]/20' },
  ];

  return (
    <section className="relative pt-8 pb-14 md:pt-14 md:pb-20 bg-[#F4F7FE] text-[#0F172A] overflow-hidden border-b border-slate-200/80">
      {/* Layered Architectural Mesh + Dot Grid Backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 ui-canvas-gradient" />
        <div className="absolute inset-0 cyber-dots-pattern opacity-40" />
        <div className="hidden sm:block absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="hidden sm:block absolute top-12 right-8 w-80 h-80 rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#081e4a]/15 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[#0F172A]">2-Day Hands-On AI Bootcamp</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#081e4a]">Live Mentorship</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.15rem] font-black tracking-tight text-[#0F172A] leading-[1.12]">
              Master Practical AI &amp; Build Real Workflows in{' '}
              <span className="text-[#081e4a] underline decoration-sky-400/60 decoration-4 underline-offset-4">
                One Weekend
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Go from zero AI background to building custom AI assistants, multi-step automations, and functional web prototypes with live step-by-step mentorship.
            </p>

            {/* Compact 2x2 Pillars on Both Mobile & Desktop */}
            <div className="grid grid-cols-2 gap-2.5 max-w-xl mx-auto lg:mx-0 pt-1 text-left">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.label}
                    className="flex items-center gap-2 sm:gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-[11px] sm:text-xs font-bold text-[#0F172A]"
                  >
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${pillar.tint}`}>
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="leading-tight">{pillar.label}</span>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 pt-1">
              <Button
                variant="gradient"
                size="lg"
                onClick={onRegisterClick}
                className="rounded-xl shadow-lg shadow-[#081e4a]/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Register Now
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onExploreCurriculum}
                className="rounded-xl"
                leftIcon={<BookOpen className="w-4 h-4 text-[#081e4a]" />}
              >
                Explore Curriculum
              </Button>

              <Link
                to="/signin"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#081e4a]/40 text-[#081e4a] text-sm font-bold shadow-2xs transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#081e4a]" />
                <span>Sign In</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Flagship Cohort Showcase Card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6"
          >
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_24px_60px_-15px_rgba(8,30,74,0.16)] overflow-hidden max-w-lg mx-auto lg:ml-auto">
              <div className="p-3.5 sm:p-5 space-y-4">
                <div className="group relative rounded-2xl overflow-hidden aspect-[16/9] bg-[#081E4A] border border-slate-200/80 shadow-inner">
                  <img
                    src="/assets/hero-cohort-showcase.jpg"
                    alt="AI Launchpad Live Bootcamp"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  {/* Live Workshop Status Pill Top-Left */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#081e4a]/80 backdrop-blur-md border border-white/20 text-white shadow-sm">
                      <Sparkles className="w-3 h-3 text-sky-300" />
                      <span>Live Hands-On Session</span>
                    </span>
                  </div>

                  {/* Bottom Cohort Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081e4a]/95 via-[#081e4a]/45 to-transparent flex items-end p-4 sm:p-5">
                    <div className="text-white w-full flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#081e4a]/80 backdrop-blur-md border border-white/25 text-white">
                          Batch {currentBatch.batchCode}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-200 border border-emerald-400/35 backdrop-blur-md">
                          <Users className="w-3 h-3" />
                          {currentBatch.availableSeats} Seats Open
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                        {currentBatch.dateRange}
                      </h3>
                      <p className="text-xs text-slate-200 font-medium">
                        {currentBatch.timings} • Led by Vikram Malhotra
                      </p>
                    </div>
                  </div>
                </div>

                {/* Micro Session Highlights Strip */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="px-2 py-2 rounded-xl bg-[#F4F7FE] border border-slate-200/80">
                    <div className="text-xs font-extrabold text-[#081e4a]">10 Hours</div>
                    <div className="text-[10px] text-slate-500 font-medium">Guided Labs</div>
                  </div>
                  <div className="px-2 py-2 rounded-xl bg-[#F4F7FE] border border-slate-200/80">
                    <div className="text-xs font-extrabold text-[#081e4a]">Sat &amp; Sun</div>
                    <div className="text-[10px] text-slate-500 font-medium">Weekend Format</div>
                  </div>
                  <div className="px-2 py-2 rounded-xl bg-[#F4F7FE] border border-slate-200/80">
                    <div className="text-xs font-extrabold text-[#081e4a]">Certificate</div>
                    <div className="text-[10px] text-slate-500 font-medium">ID Verified</div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Full 2-Day Pass
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#0F172A]">
                      ₹{currentBatch.pricing.basePrice.toLocaleString('en-IN')}
                      <span className="text-xs font-semibold text-slate-500 ml-1">
                        + 18% GST
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="gradient"
                    size="md"
                    onClick={onRegisterClick}
                    className="rounded-xl px-5 py-3 shadow-md shadow-[#081e4a]/20 shrink-0"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Reserve Seat
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
