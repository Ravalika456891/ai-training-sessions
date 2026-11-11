import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  MessageSquare,
  Code,
  Image as ImageIcon,
  Workflow,
  Search,
  Sparkles,
  Info,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { SegmentedTabs, type SegmentedTabItem } from '../ui/SegmentedTabs';
import { MotionReveal, MotionBentoCard } from '../ui/MotionPrimitives';
import { AI_TOOLS_DATA } from '../../data/workshopData';
import type { AITool } from '../../types/workshop';

export const AIToolsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'LLMs & Reasoning',
    'Creative & Media',
    'Code & Prototype',
    'Workflow & Automation',
  ];

  const categoryTabs: SegmentedTabItem[] = categories.map((category) => ({
    value: category,
    label: category,
  }));

  const filteredTools =
    selectedCategory === 'All'
      ? AI_TOOLS_DATA
      : AI_TOOLS_DATA.filter((t) => t.category === selectedCategory);

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-5 h-5 text-[#1D4ED8]" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-[#1D4ED8]" />;
      case 'Code':
        return <Code className="w-5 h-5 text-[#1D4ED8]" />;
      case 'Image':
        return <ImageIcon className="w-5 h-5 text-[#1D4ED8]" />;
      case 'Workflow':
        return <Workflow className="w-5 h-5 text-[#1D4ED8]" />;
      case 'Search':
        return <Search className="w-5 h-5 text-[#1D4ED8]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#1D4ED8]" />;
    }
  };

  const getTierBadgeVariant = (tier: AITool['accessTier']) => {
    switch (tier) {
      case 'Free Available':
        return 'success';
      case 'Freemium / Free Trial':
        return 'primary';
      default:
        return 'outline';
    }
  };

  return (
    <section
      id="tools"
      className="py-20 sm:py-24 stylish-3d-view-backdrop relative scroll-mt-20 overflow-hidden border-b border-slate-200/80"
    >
      <div className="stylish-3d-bg-layer" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 cyber-dots-pattern opacity-35" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md" icon={<Cpu className="w-3.5 h-3.5 text-[#1D4ED8]" />}>
            Ecosystem &amp; Tooling
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Industry-Standard{' '}
            <span className="bg-gradient-to-r from-[#0A2558] via-[#1D4ED8] to-[#0EA5E9] bg-clip-text text-transparent">
              AI Tools
            </span>{' '}
            You Will Master
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Filter the stack by capability below. Every exercise works with complimentary plans or free trial tiers.
          </p>
        </MotionReveal>

        {/* Radix UI Category Switcher Tabs */}
        <div className="mt-8">
          <SegmentedTabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            items={categoryTabs}
            layoutId="aiToolFilterTabs"
          />
        </div>

        {/* Tools Bento Grid */}
        <motion.div
          layout
          className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTools.map((tool, idx) => (
            <MotionBentoCard
              key={tool.name}
              delay={idx * 0.03}
              className="group p-6 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0A2558] via-[#1D4ED8] to-[#0EA5E9] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getToolIcon(tool.icon)}
                  </div>
                  <Badge variant={getTierBadgeVariant(tool.accessTier)} size="sm">
                    {tool.accessTier}
                  </Badge>
                </div>

                <h3 className="text-lg font-extrabold text-[#0F172A] mt-4 group-hover:text-[#1D4ED8] transition-colors">
                  {tool.name}
                </h3>
                <span className="text-xs text-[#1D4ED8] font-semibold">
                  {tool.category}
                </span>

                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>Guided interactive lab included</span>
              </div>
            </MotionBentoCard>
          ))}
        </motion.div>

        <MotionReveal delay={0.1} className="mt-10 max-w-3xl mx-auto">
          <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 text-xs text-slate-600 flex items-start gap-3 shadow-sm">
            <Info className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#0F172A]">Transparent Access Policy:</strong> All required workshop exercises can be performed using completely free plans or complimentary trials. We never require paid tool subscriptions to finish labs or earn your certificate.
            </p>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
};
