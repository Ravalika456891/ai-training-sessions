import React, { useState } from 'react';
import {
  Download,
  FileText,
  Code2,
  Cpu,
  CheckCircle2,
  Lock,
  AlertCircle,
  Presentation,
  Eye,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useDashboard } from './DashboardLayout';

export const DashboardMaterials: React.FC = () => {
  const { dashboardData, isEnrolling, enrollInBatch, openCheckout } = useDashboard();
  const workshops = dashboardData?.workshops || [];
  const availableWorkshops = dashboardData?.availableWorkshops || [];

  const primary = workshops.find((w: any) => w.isAuthorized) || workshops[0] || null;
  const previewBatch = availableWorkshops[0] || null;
  const isAuthorized = Boolean(primary?.isAuthorized);

  const [activeTab, setActiveTab] = useState<'all' | 'slides' | 'notes' | 'prompts' | 'projects'>('all');
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const rawResources =
    primary?.resources ||
    previewBatch?.materialsPreview || [
      {
        id: 'preview-slide-1',
        title: 'Day 1 & Day 2 Masterclass Slide Deck (Complete Visual Guide)',
        description:
          '65+ annotated slides covering LLM architectures, context windows, RAG pipelines, and agent patterns.',
        section: 'slides',
        type: 'Slide Deck',
        isGated: true,
      },
      {
        id: 'preview-prompt-1',
        title: 'Module 1 & 2: Reusable 10-Prompt Enterprise Library',
        description:
          'Battle-tested system prompt templates for GPT-4o, Claude 3.5 Sonnet, and Gemini 2.0.',
        section: 'prompts',
        type: 'Prompt Template',
        isGated: true,
      },
      {
        id: 'preview-notes-1',
        title: 'Module 3: Custom Assistant Grounding & RAG PDF Guide',
        description:
          'Step-by-step architecture playbook for building hallucination-free enterprise AI assistants.',
        section: 'notes',
        type: 'Notes & PDF',
        isGated: true,
      },
      {
        id: 'preview-project-1',
        title: 'Module 5: React + Tailwind AI Prototype Starter Repository',
        description:
          'Production-ready full-stack starter kit with streaming LLM responses and tool calling.',
        section: 'projects',
        type: 'Project Resource',
        isGated: true,
      },
    ];

  const filteredResources =
    activeTab === 'all'
      ? rawResources
      : rawResources.filter((r: any) => r.section === activeTab);

  const handleAccessResource = (resource: any) => {
    if (!isAuthorized) {
      setDownloadNotice(
        'This resource is part of the paid workshop curriculum. Click "Enroll & Pay" above to unlock full access and downloads.'
      );
      return;
    }
    if (resource.content) {
      setSelectedResource(resource);
      return;
    }
    if (resource.downloadUrl && resource.downloadUrl.startsWith('http')) {
      window.open(resource.downloadUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setDownloadNotice(`Downloading "${resource.title}"...`);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const getIcon = (section: string) => {
    if (section === 'slides') return Presentation;
    if (section === 'prompts') return Cpu;
    if (section === 'projects') return Code2;
    return FileText;
  };

  const tabs: { id: 'all' | 'slides' | 'notes' | 'prompts' | 'projects'; label: string }[] = [
    { id: 'all', label: 'All Materials' },
    { id: 'slides', label: 'Slides' },
    { id: 'notes', label: 'Notes & PDFs' },
    { id: 'prompts', label: 'Prompt Templates' },
    { id: 'projects', label: 'Project Resources' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Learning Materials
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAuthorized
              ? 'Access and download your workshop slides, study notes, reusable prompt templates, and starter project resources.'
              : 'Preview the workshop slides, study notes, prompt templates, and project resources included in your cohort.'}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border self-start sm:self-auto ${
            isAuthorized
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-[#1F386B]/[0.06] text-[#1F386B] border-[#1F386B]/20'
          }`}
        >
          {isAuthorized ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-[#1F386B]" />
          )}
          <span>{isAuthorized ? 'Materials Unlocked' : 'Material Previews • Locked'}</span>
        </span>
      </div>

      {/* Contextual Payment Banner for Unpaid Registered Users */}
      {!isAuthorized && (
        <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                {primary
                  ? 'Payment Pending — Complete Checkout to Unlock Downloads'
                  : 'Preview Mode — Confirmed Enrollment Required for Downloads'}
              </p>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                You can browse all material titles and descriptions below. Complete your verified workshop payment to unlock full slide decks, PDF guides, copyable prompt templates, and starter code repositories.
              </p>
            </div>
          </div>

          {primary ? (
            <button
              onClick={() => openCheckout(primary.enrollmentId)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#E41937] hover:bg-[#c5122d] text-white font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Enroll & Pay Now</span>
            </button>
          ) : (
            previewBatch && (
              <button
                disabled={isEnrolling}
                onClick={() => enrollInBatch(previewBatch._id)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#E41937] hover:bg-[#c5122d] text-white font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-60"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{isEnrolling ? 'Reserving...' : 'Enroll & Pay'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#1F386B] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-[#0F172A] border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {downloadNotice && (
        <div className="p-3.5 rounded-xl bg-[#1F386B]/[0.06] border border-[#1F386B]/20 text-[#1F386B] text-xs flex items-center justify-between">
          <span>{downloadNotice}</span>
          <button
            onClick={() => setDownloadNotice(null)}
            className="text-blue-500 hover:text-[#E41937] font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Materials Grid (Always displays previews for unpaid users and full access for paid students) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((m: any) => {
          const Icon = getIcon(m.section);
          return (
            <div
              key={m.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#1F386B]/[0.06] text-[#1F386B] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#1F386B]/[0.06] text-[#1F386B] border border-[#1F386B]/20">
                    {m.type}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#0F172A] leading-snug">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  {m.section}
                </span>
                <button
                  onClick={() => handleAccessResource(m)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isAuthorized
                      ? 'bg-[#E41937] hover:bg-[#c5122d] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {isAuthorized ? (
                    m.content ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Copy</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Open Resource</span>
                      </>
                    )
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Locked • Enroll to Access</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource Preview Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F386B]">
                  {selectedResource.type}
                </span>
                <h3 className="font-extrabold text-base text-[#0F172A]">
                  {selectedResource.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">{selectedResource.description}</p>

            {selectedResource.content && (
              <pre className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[#0F172A] text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-64">
                {selectedResource.content}
              </pre>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              {selectedResource.content && (
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(selectedResource.content);
                    setDownloadNotice('Copied template to clipboard!');
                    setSelectedResource(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#1F386B] text-white text-xs font-bold cursor-pointer"
                >
                  Copy Content
                </button>
              )}
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
