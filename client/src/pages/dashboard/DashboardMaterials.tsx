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
} from 'lucide-react';
import { useDashboard } from './DashboardLayout';

export const DashboardMaterials: React.FC = () => {
  const { dashboardData, openCheckout } = useDashboard();
  const workshops = dashboardData?.workshops || [];
  const primary = workshops.find((w: any) => w.isAuthorized) || workshops[0];
  const isAuthorized = Boolean(primary?.isAuthorized);

  const [activeTab, setActiveTab] = useState<'all' | 'slides' | 'notes' | 'prompts' | 'projects'>('all');
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const rawResources = primary?.resources || [];

  const filteredResources =
    activeTab === 'all'
      ? rawResources
      : rawResources.filter((r: any) => r.section === activeTab);

  const handleAccessResource = (resource: any) => {
    if (!isAuthorized) {
      setDownloadNotice('Complete your workshop enrollment payment to unlock learning materials.');
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
            Access your workshop slides, study notes, reusable prompt templates, and starter project resources.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border self-start sm:self-auto ${
            isAuthorized
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {isAuthorized ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-amber-600" />
          )}
          <span>{isAuthorized ? 'Materials Unlocked' : 'Materials Locked'}</span>
        </span>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-[#0F172A] border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {downloadNotice && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs flex items-center justify-between">
          <span>{downloadNotice}</span>
          <button
            onClick={() => setDownloadNotice(null)}
            className="text-indigo-500 hover:text-indigo-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {!isAuthorized && primary && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-900">Verified Enrollment Required</p>
              <p className="text-amber-700 text-[11px]">
                Complete your cohort payment to unlock all slide decks, notes, prompt templates, and project starter repositories.
              </p>
            </div>
          </div>
          <button
            onClick={() => openCheckout(primary.enrollmentId)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Complete Payment</span>
          </button>
        </div>
      )}

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((m: any) => {
          const Icon = getIcon(m.section);
          return (
            <div
              key={m.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
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
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
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
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
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
