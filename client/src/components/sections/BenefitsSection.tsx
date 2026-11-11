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
        return <Cpu className="w-6 h-6 text-blue-600 group-hover:scale-105 transition-transform" />;
      case 'Terminal':
        return <Terminal className="w-6 h-6 text-blue-600 group-hover:scale-105 transition-transform" />;
      case 'Bot':
        return <Bot className="w-6 h-6 text-blue-600 group-hover:scale-105 transition-transform" />;
      case 'Palette':
        return <Palette className="w-6 h-6 text-blue-600 group-hover:scale-105 transition-transform" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-blue-600 group-hover:scale-105 transition-transform" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-blue-600 group-hover:scale-105 transition-transform" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-600 group-hover:scale-105 transition-transform" />;
    }
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-current" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-current" />;
      case 'Rocket':
        return <Rocket className="w-5 h-5 text-current" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-current" />;
      default:
        return <Sparkles className="w-5 h-5 text-current" />;
    }
  };

  return (
    <section
      id="outcomes"
      className="py-24 stylish-3d-view-backdrop relative scroll-mt-20 overflow-hidden border-b border-slate-200/80"
    >
      {/* 3D Photorealistic Landscape & Vector Mesh Backdrop */}
      <div className="stylish-3d-bg-layer" />
      <div className="stylish-3d-vector-mesh" />

      {/* Dynamic & Responsive High-Tech SVG Background Artwork & Light Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      >
        {/* Soft Responsive Ambient Glow Spheres */}
        <div className="absolute -top-32 -left-20 w-[24rem] sm:w-[36rem] h-[24rem] sm:h-[36rem] rounded-full bg-blue-400/10 blur-3xl animate-ambient-pulse-slow" />
        <div className="absolute top-1/4 -right-20 w-[22rem] sm:w-[32rem] h-[22rem] sm:h-[32rem] rounded-full bg-indigo-400/10 blur-3xl animate-ambient-pulse-delayed" />
        <div className="absolute -bottom-24 left-1/3 w-[24rem] sm:w-[36rem] h-[24rem] sm:h-[36rem] rounded-full bg-cyan-400/10 blur-3xl" />

        {/* Cyber Dot-Grid Matrix Texture */}
        <div className="absolute inset-0 cyber-dots-pattern opacity-40" />

        {/* High-Tech Vector Circuit & AI Neural Constellation Pattern */}
        <svg
          className="absolute inset-0 w-full h-full object-cover opacity-25 sm:opacity-35"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="neuralLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
            </linearGradient>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Connected Network Nodes & Grid Pathways */}
          <g stroke="url(#neuralLineGrad)" strokeWidth="1" strokeDasharray="3 3">
            <line x1="80" y1="120" x2="340" y2="220" />
            <line x1="340" y1="220" x2="680" y2="160" />
            <line x1="680" y1="160" x2="1020" y2="280" />
            <line x1="1020" y1="280" x2="1360" y2="180" />

            <line x1="140" y1="460" x2="420" y2="520" />
            <line x1="420" y1="520" x2="740" y2="440" />
            <line x1="740" y1="440" x2="1100" y2="560" />
            <line x1="1100" y1="560" x2="1380" y2="480" />

            <line x1="340" y1="220" x2="420" y2="520" />
            <line x1="680" y1="160" x2="740" y2="440" />
            <line x1="1020" y1="280" x2="1100" y2="560" />
          </g>

          {/* Interactive Luminous AI Coordinate Dots */}
          <circle cx="80" cy="120" r="4" fill="#3b82f6" fillOpacity="0.6" />
          <circle cx="80" cy="120" r="10" fill="url(#nodeGlow)" />
          <circle cx="340" cy="220" r="4.5" fill="#2563eb" fillOpacity="0.8" />
          <circle cx="680" cy="160" r="3.5" fill="#6366f1" fillOpacity="0.7" />
          <circle cx="1020" cy="280" r="5" fill="#3b82f6" fillOpacity="0.7" />
          <circle cx="1360" cy="180" r="4" fill="#0ea5e9" fillOpacity="0.6" />

          <circle cx="420" cy="520" r="4" fill="#2563eb" fillOpacity="0.7" />
          <circle cx="740" cy="440" r="5" fill="#6366f1" fillOpacity="0.8" />
          <circle cx="1100" cy="560" r="4.5" fill="#0ea5e9" fillOpacity="0.7" />

          {/* Subtle Cyber Reticles and Corner Coordinates */}
          <path d="M 60 70 L 60 85 M 60 70 L 75 70" stroke="#94a3b8" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
          <path d="M 1380 70 L 1380 85 M 1380 70 L 1365 70" stroke="#94a3b8" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
          <text x="80" y="80" fill="#94a3b8" fillOpacity="0.5" fontSize="10" fontFamily="monospace">SYS.AI_OUTCOMES // 2-DAY MATRIX</text>
          <text x="1220" y="80" fill="#94a3b8" fillOpacity="0.5" fontSize="10" fontFamily="monospace">SCALE: RESPONSIVE</text>
        </svg>

        {/* Smooth Top & Bottom Section Blend Masks */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Frosted Glass Backdrop for Perfect Legibility */}
        <div className="text-center max-w-3xl mx-auto space-y-4 p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm relative z-10">
          <div>
            <Badge variant="primary" size="md">
              Tangible Capabilities
            </Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-slate-900 tracking-tight">
            What You Will Build & Master in{' '}
            <span className="text-blue-600 drop-shadow-2xs">
              2 Days
            </span>
          </h2>
          <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Move beyond superficial chat prompts. You will walk away with concrete, deployable assets and automation pipelines designed for real-world productivity.
          </p>
        </div>

        {/* 6 Core Learning Outcomes Grid */}
        <div className="mt-12 sm:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {LEARNING_OUTCOMES.map((outcome, idx) => (
            <div
              key={outcome.id}
              className="stylish-glass-card group relative p-6 sm:p-7 flex flex-col justify-between rounded-2xl overflow-hidden cursor-default"
            >
              {/* Dynamic Top Gradient Accent Shimmer on Hover */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {/* Glowing Icon Container */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/80 border border-blue-200/80 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:shadow-md group-hover:border-blue-300 transition-all duration-300">
                    {getOutcomeIcon(outcome.iconName)}
                  </div>
                  {/* Tech Monospace Index Badge */}
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100/90 border border-slate-200/70 px-2.5 py-1 rounded-md shadow-2xs group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-blue-600 transition-colors">
                  {outcome.title}
                </h3>

                <p className="text-[#475569] text-sm leading-relaxed">
                  {outcome.description}
                </p>
              </div>

              {/* Hands-on Output Badge Box */}
              <div className="mt-6 pt-4 border-t border-slate-100/90 bg-slate-50/70 -mx-6 sm:-mx-7 -mb-6 sm:-mb-7 p-4 sm:p-5 rounded-b-2xl">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Deliverable</span>
                </div>
                <div className="text-xs font-semibold text-[#0F172A] mt-1 line-clamp-2">
                  {outcome.deliverable}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Audience Fit Section */}
        <div className="mt-20 pt-16 border-t border-slate-200/80">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="primary" size="md">
              Audience Alignment
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              Who is This Bootcamp Designed For?
            </h3>
            <p className="text-[#475569] text-sm">
              Whether you are a newcomer or looking to scale your workplace efficiency, this curriculum meets you at your experience level.
            </p>
          </div>

          {/* Interactive Persona Tabs */}
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm max-w-3xl mx-auto">
              {AUDIENCE_PERSONAS.map((item, idx) => (
                <button
                  key={item.persona}
                  onClick={() => setActivePersonaIndex(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activePersonaIndex === idx
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100/80'
                  }`}
                >
                  {getPersonaIcon(item.iconName)}
                  <span>{item.persona}</span>
                </button>
              ))}
            </div>

            {/* Active Persona Details Card */}
            <div className="mt-6 max-w-3xl mx-auto">
              <div className="stylish-glass-card p-6 sm:p-8 rounded-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-xl font-bold text-[#0F172A]">
                      {AUDIENCE_PERSONAS[activePersonaIndex].persona}
                    </h4>
                    <p className="text-sm text-blue-600 font-medium">
                      {AUDIENCE_PERSONAS[activePersonaIndex].tagline}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onRegisterClick}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Enroll Now
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2 bg-slate-50/90 p-4 rounded-xl border border-slate-200/80">
                    <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                      Current Challenge
                    </span>
                    <p className="text-sm text-[#475569] leading-relaxed">
                      {AUDIENCE_PERSONAS[activePersonaIndex].painPoint}
                    </p>
                  </div>

                  <div className="space-y-2 bg-blue-50/70 p-4 rounded-xl border border-blue-200/80">
                    <span className="text-xs uppercase font-bold text-blue-700 tracking-wider">
                      Your Bootcamp Transformation
                    </span>
                    <p className="text-sm text-[#0F172A] leading-relaxed font-medium">
                      {AUDIENCE_PERSONAS[activePersonaIndex].takeaway}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
