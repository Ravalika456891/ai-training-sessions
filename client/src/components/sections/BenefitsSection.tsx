import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Terminal,
  Bot,
  Palette,
  Layers,
  Zap,
  GraduationCap,
  Briefcase,
  Rocket,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SegmentedTabs, type SegmentedTabItem } from '../ui/SegmentedTabs';
import { MotionReveal, MotionBentoCard } from '../ui/MotionPrimitives';
import { LEARNING_OUTCOMES, AUDIENCE_PERSONAS } from '../../data/workshopData';

interface BenefitsSectionProps {
  onRegisterClick: () => void;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ onRegisterClick }) => {
  const [activePersona, setActivePersona] = useState(AUDIENCE_PERSONAS[0].persona);

  const getOutcomeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-[#081e4a]" />;
      case 'Terminal':
        return <Terminal className="w-6 h-6 text-[#081e4a]" />;
      case 'Bot':
        return <Bot className="w-6 h-6 text-[#081e4a]" />;
      case 'Palette':
        return <Palette className="w-6 h-6 text-[#081e4a]" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-[#081e4a]" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-[#081e4a]" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#081e4a]" />;
    }
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 shrink-0" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 shrink-0" />;
      case 'Rocket':
        return <Rocket className="w-4 h-4 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 shrink-0" />;
    }
  };

  const personaTabs: SegmentedTabItem[] = AUDIENCE_PERSONAS.map((item) => ({
    value: item.persona,
    label: item.persona,
    icon: getPersonaIcon(item.iconName),
  }));

  const currentPersona =
    AUDIENCE_PERSONAS.find((p) => p.persona === activePersona) || AUDIENCE_PERSONAS[0];

  return (
    <section
      id="outcomes"
      className="py-20 sm:py-24 stylish-3d-view-backdrop relative scroll-mt-20 overflow-hidden border-b border-slate-200/80"
    >
      <div className="stylish-3d-bg-layer" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 cyber-dots-pattern opacity-35" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md">
            Tangible Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-[#0F172A] tracking-tight">
            What You Will Build &amp; Master in{' '}
            <span className="text-[#081e4a]">
              2 Days
            </span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Move beyond basic chat prompts. Walk away with concrete, deployable assistants, storyboards, prototypes, and automation pipelines.
          </p>
        </MotionReveal>

        {/* 6 Core Learning Outcomes Bento Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEARNING_OUTCOMES.map((outcome, idx) => (
            <MotionBentoCard
              key={outcome.id}
              delay={idx * 0.04}
              className="group relative p-6 flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#081e4a] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50/90 border border-[#081e4a]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getOutcomeIcon(outcome.iconName)}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#081e4a] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#081e4a] transition-colors">
                  {outcome.title}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed">
                  {outcome.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/80 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#081e4a] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Deliverable</span>
                </div>
                <div className="text-xs font-semibold text-[#0F172A] mt-1 line-clamp-2">
                  {outcome.deliverable}
                </div>
              </div>
            </MotionBentoCard>
          ))}
        </div>

        {/* Audience Alignment Section (Radix UI Tabs + Motion) */}
        <div className="mt-20 pt-16 border-t border-slate-200/80">
          <MotionReveal className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="primary" size="md">
              Audience Alignment
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
              Who is This Bootcamp Designed For?
            </h3>
            <p className="text-slate-600 text-sm">
              Select your profile below to see how this curriculum transforms your day-to-day workflow.
            </p>
          </MotionReveal>

          <div className="mt-8 space-y-6">
            <SegmentedTabs
              value={activePersona}
              onValueChange={setActivePersona}
              items={personaTabs}
              layoutId="audiencePersonaTabs"
            />

            <div className="max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPersona.persona}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-blue-950/6 p-6 sm:p-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-xl font-extrabold text-[#0F172A]">
                        {currentPersona.persona}
                      </h4>
                      <p className="text-sm text-[#081e4a] font-semibold">
                        {currentPersona.tagline}
                      </p>
                    </div>
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={onRegisterClick}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Enroll Now
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
                    <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      <span className="text-[11px] uppercase font-extrabold text-slate-500 tracking-wider block">
                        Current Challenge
                      </span>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {currentPersona.painPoint}
                      </p>
                    </div>

                    <div className="space-y-2 bg-blue-50/70 p-4 rounded-2xl border border-[#081e4a]/20">
                      <span className="text-[11px] uppercase font-extrabold text-[#081e4a] tracking-wider block">
                        Your Bootcamp Transformation
                      </span>
                      <p className="text-sm text-[#0F172A] leading-relaxed font-semibold">
                        {currentPersona.takeaway}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
