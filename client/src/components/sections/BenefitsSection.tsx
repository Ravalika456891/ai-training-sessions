import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { LEARNING_OUTCOMES, AUDIENCE_PERSONAS } from '../../data/workshopData';

interface BenefitsSectionProps {
  onRegisterClick: () => void;
}

export const BenefitsSection: React.FC<BenefitsSectionProps> = ({ onRegisterClick }) => {
  const [activePersonaIndex, setActivePersonaIndex] = useState(0);

  const getOutcomeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-brand-cyan" />;
      case 'Terminal':
        return <Terminal className="w-6 h-6 text-brand-violet" />;
      case 'Bot':
        return <Bot className="w-6 h-6 text-indigo-400" />;
      case 'Palette':
        return <Palette className="w-6 h-6 text-purple-400" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-cyan-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-brand-cyan" />;
    }
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-brand-cyan" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-brand-violet" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <section id="outcomes" className="py-20 bg-navy-950/60 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="purple" size="md">
            Tangible Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What You Will Build & Master in{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-violet to-brand-cyan">
              2 Days
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Move beyond superficial chat prompts. You will walk away with concrete, deployable assets and automation pipelines designed for real-world productivity.
          </p>
        </div>

        {/* 6 Core Learning Outcomes Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEARNING_OUTCOMES.map((outcome, idx) => (
            <Card key={outcome.id} hoverable className="p-6 flex flex-col justify-between border-slate-800">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-navy-800 border border-slate-700/60 flex items-center justify-center">
                    {getOutcomeIcon(outcome.iconName)}
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-semibold">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-brand-cyan transition-colors">
                  {outcome.title}
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed">
                  {outcome.description}
                </p>
              </div>

              {/* Hands-on Output Badge */}
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Deliverable</span>
                </div>
                <div className="text-xs font-medium text-slate-200 mt-1">
                  {outcome.deliverable}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Audience Fit Section */}
        <div className="mt-20 pt-16 border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="cyan" size="md">
              Audience Alignment
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Who is This Bootcamp Designed For?
            </h3>
            <p className="text-slate-400 text-sm">
              Whether you are a newcomer or looking to scale your workplace efficiency, this curriculum meets you at your experience level.
            </p>
          </div>

          {/* Interactive Persona Tabs */}
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-navy-900 border border-slate-800 max-w-3xl mx-auto">
              {AUDIENCE_PERSONAS.map((item, idx) => (
                <button
                  key={item.persona}
                  onClick={() => setActivePersonaIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activePersonaIndex === idx
                      ? 'bg-gradient-to-r from-brand-violet to-brand-indigo text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {getPersonaIcon(item.iconName)}
                  <span>{item.persona}</span>
                </button>
              ))}
            </div>

            {/* Active Persona Details Card */}
            <div className="mt-6 max-w-3xl mx-auto">
              <Card glow className="p-6 sm:p-8 border-indigo-500/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white">
                      {AUDIENCE_PERSONAS[activePersonaIndex].persona}
                    </h4>
                    <p className="text-sm text-brand-cyan font-medium">
                      {AUDIENCE_PERSONAS[activePersonaIndex].tagline}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2 bg-navy-950/50 p-4 rounded-xl border border-slate-800/80">
                    <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">
                      Current Challenge
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {AUDIENCE_PERSONAS[activePersonaIndex].painPoint}
                    </p>
                  </div>

                  <div className="space-y-2 bg-navy-950/50 p-4 rounded-xl border border-emerald-500/20">
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                      Your Bootcamp Transformation
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {AUDIENCE_PERSONAS[activePersonaIndex].takeaway}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

