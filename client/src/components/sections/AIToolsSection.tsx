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
import { Card } from '../common/Card';
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
    <section id="tools" className="py-20 bg-white relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary" size="md">
            Ecosystem & Tooling
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Industry-Standard AI Tools You Will Master
          </h2>
          <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
            We curate the most reliable and productive tools in the current ecosystem. Complete transparency regarding tiers and free alternatives.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 border border-slate-200 text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/60'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tools Cards Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card key={tool.name} hoverable className="p-6 border-slate-200 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
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

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Guided interactive lab included</span>
              </div>
            </Card>
          ))}
        </div>

        {/* PRD Disclosed Access Caveat Note */}
        <div className="mt-8 max-w-3xl mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#475569] flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#0F172A]">Transparent Access Policy:</strong> All required workshop exercises can be performed using completely free plans or complimentary trials. We demonstrate optional premium features for reference but will never require paid tool subscriptions to complete the bootcamp or earn your certificate.
          </p>
        </div>
      </div>
    </section>
  );
};
