import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, ExternalLink, Code2, Loader2, FileCheck } from 'lucide-react';
import { useDashboard } from './DashboardLayout';
import { Button } from '../../components/common/Button';

export const DashboardAssignments: React.FC = () => {
  const { dashboardData, refreshDashboard } = useDashboard();
  const workshops = dashboardData?.workshops || [];
  const submissions = dashboardData?.submissions || [];
  const primary = workshops[0];
  const isAuthorized = primary?.isAuthorized;

  const [projectTitle, setProjectTitle] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      setErrorMsg('Project title is required.');
      return;
    }

    if (!primary) {
      setErrorMsg('You must have an active workshop enrollment to submit assignments.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/learners/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
        body: JSON.stringify({
          enrollmentId: primary.enrollmentId,
          projectTitle: projectTitle.trim(),
          repositoryUrl: repoUrl.trim(),
          liveDemoUrl: demoUrl.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Submission failed.');
      }

      setSuccessMsg('Capstone project submitted successfully! Evaluated projects qualify for verified certification.');
      setProjectTitle('');
      setRepoUrl('');
      setDemoUrl('');
      setNotes('');
      await refreshDashboard();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Capstone Project & Assignments
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Submit your functional AI prototype deliverables for mentor code review and certificate qualification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Submit Capstone Deliverable</span>
            </h3>
            {primary && (
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Cohort: {primary.workshop?.batchCode}
              </span>
            )}
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Real-Time Customer Support Voice Agent"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Live Demo / Deployed URL</label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://my-ai-app.vercel.app"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Architecture & Technical Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe LLM model used, prompt techniques, and tools integrated..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors bg-white"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || !isAuthorized}
              className="w-full"
              rightIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            >
              {isSubmitting ? 'Submitting Deliverable...' : 'Submit Capstone for Mentor Evaluation'}
            </Button>

            {!isAuthorized && (
              <p className="text-[11px] text-amber-700 text-center">
                Submissions are unlocked once your cohort enrollment is confirmed.
              </p>
            )}
          </form>
        </div>

        {/* Deliverables History Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Submitted Deliverables</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {submissions.length} Total
              </span>
            </h3>

            {submissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">No submissions yet.</p>
                <p>Submit your Day 2 capstone project using the form.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub: any, idx: number) => (
                  <div
                    key={sub._id || idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-[#0F172A]">{sub.projectTitle}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                        {sub.status || 'submitted'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      {sub.repositoryUrl && (
                        <a
                          href={sub.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-mono"
                        >
                          <Code2 className="w-3 h-3" />
                          <span>Code</span>
                        </a>
                      )}
                      {sub.liveDemoUrl && (
                        <a
                          href={sub.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 font-mono"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Demo</span>
                        </a>
                      )}
                      <span className="ml-auto text-slate-400">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
