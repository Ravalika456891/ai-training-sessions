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
        return <Brain className="w-5 h-5 text-brand-violet" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-brand-cyan" />;
      case 'Code':
        return <Code className="w-5 h-5 text-indigo-400" />;
      case 'Image':
        return <ImageIcon className="w-5 h-5 text-purple-400" />;
      case 'Workflow':
        return <Workflow className="w-5 h-5 text-amber-400" />;
      case 'Search':
        return <Search className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-brand-cyan" />;
    }
  };

  const getTierBadgeVariant = (tier: AITool['accessTier']) => {
    switch (tier) {
      case 'Free Available':
        return 'success';
      case 'Freemium / Free Trial':
        return 'cyan';
      case 'Subscription Optional':
        return 'warning';
      default:
        return 'outline';
    }
  };

  return (
    <section id="tools" className="py-20 bg-navy-950 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="purple" size="md">
            Ecosystem & Tooling
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Industry-Standard AI Tools You Will Master
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
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
                  ? 'bg-brand-indigo text-white shadow-md shadow-indigo-500/25'
                  : 'bg-navy-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tools Cards Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Card key={tool.name} hoverable className="p-6 border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-navy-800 border border-slate-700 flex items-center justify-center">
                    {getToolIcon(tool.icon)}
                  </div>
                  <Badge variant={getTierBadgeVariant(tool.accessTier)} size="sm">
                    {tool.accessTier}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-white mt-4">
                  {tool.name}
                </h3>
                <span className="text-xs text-indigo-300 font-medium">
                  {tool.category}
                </span>

                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Guided interactive lab included</span>
              </div>
            </Card>
          ))}
        </div>

        {/* PRD Disclosed Access Caveat Note */}
        <div className="mt-8 max-w-3xl mx-auto p-4 rounded-xl bg-navy-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
          <Info className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Transparent Access Policy:</strong> All required workshop exercises can be performed using completely free plans or complimentary trials. We demonstrate optional premium features for reference but will never require paid tool subscriptions to complete the bootcamp or earn your certificate.
          </p>
        </div>
      </div>
    </section>
  );
};
