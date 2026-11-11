import React, { useState } from 'react';
import {
  Brain,
  MessageSquare,
  Code,
  Image as ImageIcon,
  Workflow,
  Search,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { AI_TOOLS_DATA } from '../../data/workshopData';
import type { AITool } from '../../types/workshop';

export const AIToolsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'LLMs & Reasoning', 'Creative & Media', 'Code & Prototype', 'Workflow & Automation'];

  const filteredTools = selectedCategory === 'All'
    ? AI_TOOLS_DATA
    : AI_TOOLS_DATA.filter(t => t.category === selectedCategory);

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-5 h-5 text-blue-600" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'Code':
        return <Code className="w-5 h-5 text-blue-600" />;
      case 'Image':
        return <ImageIcon className="w-5 h-5 text-blue-600" />;
      case 'Workflow':
        return <Workflow className="w-5 h-5 text-blue-600" />;
      case 'Search':
        return <Search className="w-5 h-5 text-blue-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTierBadgeVariant = (tier: AITool['accessTier']) => {
    switch (tier) {
      case 'Free Available':
        return 'primary';
      case 'Freemium / Free Trial':
        return 'primary';
      case 'Subscription Optional':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <section
      id="tools"
      className="py-24 stylish-3d-view-backdrop relative scroll-mt-20 overflow-hidden border-b border-slate-200/80"
    >
      {/* 3D Photorealistic Landscape & Vector Mesh Backdrop */}
      <div className="stylish-3d-bg-layer" />
      <div className="stylish-3d-vector-mesh" />

      {/* Dynamic Luminous Ambient Glows & Cyber Dot Matrix */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      >
        <div className="absolute -top-32 -left-20 w-[24rem] sm:w-[36rem] h-[24rem] sm:h-[36rem] rounded-full bg-blue-400/15 blur-3xl animate-ambient-pulse-slow" />
        <div className="absolute top-1/2 -right-20 w-[22rem] sm:w-[32rem] h-[22rem] sm:h-[32rem] rounded-full bg-indigo-400/15 blur-3xl animate-ambient-pulse-delayed" />
        <div className="absolute -bottom-24 left-1/3 w-[24rem] sm:w-[36rem] h-[24rem] sm:h-[36rem] rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute inset-0 cyber-dots-pattern opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Frosted Glass Backdrop for Perfect Legibility */}
        <div className="text-center max-w-3xl mx-auto space-y-4 p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm relative z-10">
          <div>
            <Badge variant="primary" size="md">
              Ecosystem & Tooling
            </Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Industry-Standard AI Tools You Will Master
          </h2>
          <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            We curate the most reliable and productive tools in the current ecosystem. Complete transparency regarding tiers and free alternatives.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 relative z-10">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                  : 'bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:bg-white shadow-xs'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tools Cards Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.name}
              className="stylish-glass-card group p-6 sm:p-7 flex flex-col justify-between rounded-2xl relative overflow-hidden transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-blue-50/90 border border-blue-200/80 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    {getToolIcon(tool.icon)}
                  </div>
                  <Badge variant={getTierBadgeVariant(tool.accessTier)} size="sm">
                    {tool.accessTier}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mt-4">
                  {tool.name}
                </h3>
                <span className="text-xs text-blue-600 font-medium">
                  {tool.category}
                </span>

                <p className="text-[#475569] text-sm mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Guided interactive lab included</span>
              </div>
            </div>
          ))}
        </div>

        {/* PRD Disclosed Access Caveat Note */}
        <div className="mt-10 max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl stylish-glass-card text-xs text-[#475569] flex items-start gap-3 shadow-sm">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#0F172A]">Transparent Access Policy:</strong> All required workshop exercises can be performed using completely free plans or complimentary trials. We demonstrate optional premium features for reference but will never require paid tool subscriptions to complete the bootcamp or earn your certificate.
          </p>
        </div>
      </div>
    </section>
  );
};
