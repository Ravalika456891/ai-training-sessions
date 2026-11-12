import React, { useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Loader2,
  ClipboardCheck,
  MessageSquare,
  Lock,
  CreditCard,
} from 'lucide-react';
import { useDashboard } from './DashboardLayout';

export const DashboardAssignments: React.FC = () => {
  const { dashboardData, refreshDashboard, isEnrolling, enrollInBatch, openCheckout } = useDashboard();
  const workshops = dashboardData?.workshops || [];
  const availableWorkshops = dashboardData?.availableWorkshops || [];
  const assignments = dashboardData?.assignments || [];
  const submissions = dashboardData?.submissions || [];
  const primary = workshops.find((w: any) => w.isAuthorized) || workshops[0];
  const isAuthorized = Boolean(primary?.isAuthorized);
  const previewWorkshop = availableWorkshops[0] || primary?.workshop;

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

      setSuccessMsg(
        'Assignment submitted! Once reviewed by your instructor, your certificate eligibility updates automatically.'
      );
      setProjectTitle('');
      setRepoUrl('');
      setDemoUrl('');
      setNotes('');
      await refreshDashboard();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Assignments
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review assigned tasks, submit your capstone deliverable, and view instructor feedback.
        </p>
      </div>

      {/* Unpaid Registered User Explanatory Banner */}
      {!isAuthorized && (
        <div className="p-5 rounded-3xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-950">
                Assignment Descriptions Preview • Submission Restricted
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                You can review the Day 1 & Day 2 assignment specifications below. To submit your capstone deliverable and receive mentor feedback, please complete your workshop enrollment and payment.
              </p>
            </div>
          </div>
          {primary && !primary.isAuthorized ? (
            <button
              onClick={() => openCheckout(primary.enrollmentId)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Complete Payment (₹{(primary.workshop?.price?.basePrice || 1999).toLocaleString('en-IN')})</span>
            </button>
          ) : (
            previewWorkshop && (
              <button
                onClick={() => enrollInBatch(previewWorkshop._id)}
                disabled={isEnrolling}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E41937] hover:bg-[#c5122d] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-60"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>
                  {isEnrolling
                    ? 'Starting Checkout...'
                    : `Enroll & Pay (₹${(previewWorkshop.price || 2999).toLocaleString('en-IN')})`}
                </span>
              </button>
            )
          )}
        </div>
      )}

      {/* 1. Assigned Tasks Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider">
          Assigned Tasks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((task: any) => (
            <div
              key={task._id || task.title}
              className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#E41937]/[0.08] text-[#E41937] border border-[#E41937]/25">
                  Day {task.dayNumber || 1} Task
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Max Score: {task.maxScore || 100} pts
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#0F172A]">{task.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{task.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Submission Form & Status / Instructor Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#E41937]" />
              <span>Submit Assignment Deliverable</span>
            </h3>
            {primary && (
              <span className="text-[10px] font-mono font-bold text-[#E41937] bg-[#E41937]/[0.08] px-2.5 py-0.5 rounded-md border border-[#E41937]/25">
                {primary.workshop?.batchCode}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Custom RAG Support Assistant & Workflow"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GitHub / Code Repository URL
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Live Demo / Prototype URL
                </label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://my-ai-app.vercel.app"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Implementation Notes & Prompts Used
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe your system prompt, tools used, and workflow architecture..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isAuthorized}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#E41937] hover:bg-[#c5122d] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Submitting...' : 'Submit Assignment'}</span>
            </button>

            {!isAuthorized && (
              <p className="text-[11px] text-amber-700 text-center">
                Assignment submission unlocks once your workshop enrollment and payment are verified.
              </p>
            )}
          </form>
        </div>

        {/* Submission Status & Instructor Feedback Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                <span>Submission Status & Feedback</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {submissions.length} Submitted
              </span>
            </h3>

            {submissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">No submissions recorded yet.</p>
                <p>Submit your assignment using the form to receive instructor feedback.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub: any, idx: number) => (
                  <div
                    key={sub._id || idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-[#0F172A]">{sub.projectTitle}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
                          sub.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : sub.status === 'needs_revision'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-[#E41937]/[0.08] text-[#E41937] border-[#E41937]/25'
                        }`}
                      >
                        {sub.status || 'submitted'}
                      </span>
                    </div>

                    {sub.notes && (
                      <p className="text-[11px] text-slate-600 line-clamp-2">{sub.notes}</p>
                    )}

                    {/* Instructor Feedback Box */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                        <MessageSquare className="w-3 h-3 text-[#E41937]" />
                        <span>Instructor Feedback</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {sub.instructorFeedback ||
                          (sub.status === 'approved'
                            ? 'Approved! Strong prompt architecture and clean workflow execution.'
                            : 'Queued for mentor review. Feedback is posted within 24 hours of submission.')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      {sub.repositoryUrl && (
                        <a
                          href={sub.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#E41937] hover:underline flex items-center gap-1 font-mono"
                        >
                          <Code2 className="w-3 h-3" />
                          <span>Repo</span>
                        </a>
                      )}
                      {sub.liveDemoUrl && (
                        <a
                          href={sub.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#E41937] hover:underline flex items-center gap-1 font-mono"
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
