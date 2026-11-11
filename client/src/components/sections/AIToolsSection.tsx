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
  Users,
  BookOpen,
  Cpu,
  GraduationCap,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { SegmentedTabs, type SegmentedTabItem } from '../ui/SegmentedTabs';
import { MotionReveal, MotionBentoCard } from '../ui/MotionPrimitives';
import { AI_TOOLS_DATA } from '../../data/workshopData';
import type { AITool } from '../../types/workshop';

/** IIEM Part 6 Institutional Counter Band + Part 5 Course-style AI Stack Grid. */
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

  const stats = [
    { icon: Users, value: '1,500+', label: 'LEARNERS TRAINED' },
    { icon: BookOpen, value: '08', label: 'HANDS-ON LAB MODULES' },
    { icon: Cpu, value: '15+', label: 'AI TOOLS & WORKFLOWS' },
    { icon: GraduationCap, value: '10 HRS', label: 'LIVE BOOTCAMP TRAINING' },
  ];

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-5 h-5 text-[#E41937]" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-[#E41937]" />;
      case 'Code':
        return <Code className="w-5 h-5 text-[#E41937]" />;
      case 'Image':
        return <ImageIcon className="w-5 h-5 text-[#E41937]" />;
      case 'Workflow':
        return <Workflow className="w-5 h-5 text-[#E41937]" />;
      case 'Search':
        return <Search className="w-5 h-5 text-[#E41937]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#E41937]" />;
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
    <>
      {/* IIEM Part 6 Full-Width Navy Counter Divider Band */}
      <div className="bg-[#081e4a] text-white py-14 sm:py-16 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="space-y-2">
                  <Icon className="w-8 h-8 sm:w-9 sm:h-9 mx-auto text-[#E41937]" />
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    {item.value}
                  </div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-blue-200">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Industry AI Stack Section */}
      <section
        id="tools"
        className="py-16 sm:py-20 bg-[#F7F8FA] relative scroll-mt-20 border-b border-slate-200/80"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionReveal className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#222222] iiem-line-bottom-center">
              AI TOOLS <span className="text-[#E41937]">YOU MASTER</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed pt-2">
              Filter the practical AI stack below. Every lab runs seamlessly on complimentary plans or free trial tiers.
            </p>
          </MotionReveal>

          <div className="mt-8">
            <SegmentedTabs
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              items={categoryTabs}
              layoutId="aiToolFilterTabs"
            />
          </div>

          <motion.div
            layout
            className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTools.map((tool) => (
              <MotionBentoCard
                key={tool.name}
                className="group p-6 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-11 h-11 rounded bg-[#1F386B]/10 border border-[#1F386B]/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getToolIcon(tool.icon)}
                    </div>
                    <Badge variant={getTierBadgeVariant(tool.accessTier)} size="sm">
                      {tool.accessTier}
                    </Badge>
                  </div>

                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#E41937] mt-4">
                    {tool.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-[#222222] mt-0.5 group-hover:text-[#1F386B] transition-colors">
                    {tool.name}
                  </h3>

                  <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center gap-1.5 text-xs text-[#1F386B] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E41937]" />
                  <span>Guided interactive lab included</span>
                </div>
              </MotionBentoCard>
            ))}
          </motion.div>

          <MotionReveal className="mt-10 max-w-3xl mx-auto">
            <div className="p-4 sm:p-5 rounded-lg bg-white border border-slate-200 border-l-4 border-l-[#1F386B] text-xs text-slate-600 flex items-start gap-3 shadow-sm">
              <Info className="w-4 h-4 text-[#E41937] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-[#222222]">Transparent Access Policy:</strong> All required workshop exercises can be performed using completely free plans or complimentary trials. We never require paid tool subscriptions to finish labs or earn your certificate.
              </p>
            </div>
          </MotionReveal>
        </div>
      </section>
    </>
  );
};
