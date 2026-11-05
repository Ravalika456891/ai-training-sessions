import React, { useState } from 'react';
import { Download, FileText, Code2, Cpu, CheckCircle2, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { useDashboard } from './DashboardLayout';
import { Button } from '../../components/common/Button';

export const DashboardMaterials: React.FC = () => {
  const { dashboardData } = useDashboard();
  const workshops = dashboardData?.workshops || [];
  const primary = workshops[0];
  const isAuthorized = primary?.isAuthorized;
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownload = (title: string) => {
    if (!isAuthorized) {
      setDownloadNotice('This resource is locked. Please confirm your enrollment payment to download materials.');
      return;
    }
    setDownloadNotice(`Downloading "${title}" package...`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const materials = [
    {
      id: 'res-1',
      title: 'Enterprise Prompt Engineering Library (2026 Edition)',
      description: '10 production-tested prompt templates for zero-shot reasoning, structured JSON extraction, and role grounding.',
      format: 'PDF & Markdown Bundle (4.2 MB)',
      badge: 'Core Pack',
      icon: FileText,
    },
    {
      id: 'res-2',
      title: 'Custom AI Assistant System Instructions & Grounding Kit',
      description: 'System prompt architectures, tone guardrails, and knowledge retrieval indexing snippets.',
      format: 'YAML / Markdown Starter (1.8 MB)',
      badge: 'Day 1 Deliverable',
      icon: Cpu,
    },
    {
      id: 'res-3',
      title: 'Full-Stack React + Vite + Tailwind AI Prototype Starter',
      description: 'Clean starter repository with streaming LLM completions, UI feedback skeletons, and dark/light mode.',
      format: 'GitHub Repository / ZIP (8.5 MB)',
      badge: 'Day 2 Deliverable',
      icon: Code2,
    },
    {
      id: 'res-4',
      title: 'Multi-Step Lead Intelligence Automation Blueprint',
      description: 'Complete exportable workflow JSON for n8n and Make.com to auto-summarize web inquiries and trigger notifications.',
      format: 'Workflow JSON (350 KB)',
      badge: 'Production Automation',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Curated Learning Materials & Code Repos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Download production-ready templates, starter source code, and prompt cheatsheets.
          </p>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              isAuthorized
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isAuthorized ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isAuthorized ? 'Downloads Unlocked' : 'Materials Gated'}</span>
          </span>
        </div>
      </div>

      {downloadNotice && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center justify-between">
          <span>{downloadNotice}</span>
          <button onClick={() => setDownloadNotice(null)} className="text-blue-500 hover:text-blue-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {!isAuthorized && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-900">Download packages are locked</p>
              <p className="text-amber-700 text-[11px]">
                Confirm your cohort registration payment to access all source code templates and cheat-sheets.
              </p>
            </div>
          </div>
          <a
            href="/#pricing"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            Complete Payment (₹1,999)
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materials.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {m.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#0F172A] leading-snug">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">{m.format}</span>
                <Button
                  variant={isAuthorized ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleDownload(m.title)}
                  rightIcon={isAuthorized ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                >
                  {isAuthorized ? 'Download Package' : 'Locked'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
