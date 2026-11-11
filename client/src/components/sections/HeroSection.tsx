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
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 bg-[#F4F7FE] text-[#0F172A] overflow-hidden border-b border-slate-200/80">
      {/* Layered Architectural Mesh + Dot Grid Backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 ui-canvas-gradient" />
        <div className="absolute inset-0 cyber-dots-pattern opacity-45" />
        <div className="absolute -top-24 left-1/4 w-[28rem] h-[28rem] rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute top-12 right-10 w-[24rem] h-[24rem] rounded-full bg-sky-300/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#081e4a]/20 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#081e4a] shrink-0" />
              <span className="text-[#0F172A]">2-Day Hands-On AI Bootcamp</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#081e4a]">Live Mentorship</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-tight text-[#0F172A] leading-[1.12]">
              Master Practical AI &amp; Build Real Workflows in{' '}
              <span className="text-[#081e4a]">
                One Weekend
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Go from zero AI background to building custom AI assistants, multi-step automations, and functional web prototypes with live step-by-step mentorship.
            </p>

            {/* Bento Pillars 2x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto lg:mx-0 pt-1">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.label}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs text-xs font-bold text-[#0F172A]"
                  >
                    <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${pillar.tint}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{pillar.label}</span>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-2">
              <Button
                variant="gradient"
                size="lg"
                onClick={onRegisterClick}
                className="rounded-2xl shadow-lg shadow-blue-900/20"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Register Now
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onExploreCurriculum}
                className="rounded-2xl"
                leftIcon={<BookOpen className="w-4 h-4 text-[#081e4a]" />}
              >
                Explore Curriculum
              </Button>

              <Link
                to="/signin"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/95 hover:bg-slate-50 border border-slate-200 hover:border-[#081e4a]/40 text-[#081e4a] text-sm font-bold shadow-2xs transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#081e4a]" />
                <span>Sign In</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Elevated Bento Cohort Showcase Card (Clean top image without macOS bar) */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6"
          >
            <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-blue-950/10 overflow-hidden max-w-lg mx-auto lg:ml-auto">
              <div className="p-4 sm:p-6 space-y-5">
                <div className="group relative rounded-2xl overflow-hidden aspect-[16/9] bg-[#081E4A] border border-slate-200 shadow-inner">
                  <img
                    src="/assets/hero-cohort-showcase.jpg"
                    alt="AI Launchpad Live Bootcamp"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent flex items-end p-4 sm:p-5">
                    <div className="text-white w-full flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#081e4a] text-white">
                          Batch {currentBatch.batchCode}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 backdrop-blur-xs">
                          <Users className="w-3 h-3" />
                          {currentBatch.availableSeats} Seats Open
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold">
                        {currentBatch.dateRange}
                      </h3>
                      <p className="text-xs text-slate-200">
                        {currentBatch.timings} • Led by Vikram Malhotra
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Full 2-Day Pass
                    </div>
                    <div className="text-2xl font-black text-[#0F172A]">
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
                    className="rounded-xl px-5 py-3 shadow-md shadow-blue-900/20"
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
