import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Calendar,
  Clock,
  Video,
  Download,
  Upload,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  BookOpen
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { useAuth } from '../../context/AuthContext';

interface LearnerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCertificateVerify?: (serial: string) => void;
}

export const LearnerDashboardModal: React.FC<LearnerDashboardModalProps> = ({
  isOpen,
  onClose,
  onOpenCertificateVerify,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'workshops' | 'resources' | 'submissions' | 'certificates'>('workshops');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Submissions form state
  const [projectTitle, setProjectTitle] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [projectSuccessMsg, setProjectSuccessMsg] = useState<string | null>(null);
  const [projectErrorMsg, setProjectErrorMsg] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/learners/dashboard', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDashboardData(data.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDashboard();
      setProjectSuccessMsg(null);
      setProjectErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitProject = async (e: React.FormEvent, enrollmentId: string) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    setIsSubmittingProject(true);
    setProjectErrorMsg(null);
    setProjectSuccessMsg(null);

    try {
      const res = await fetch('/api/learners/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
        body: JSON.stringify({
          enrollmentId,
          projectTitle,
          repositoryUrl: repoUrl,
          liveDemoUrl: demoUrl,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit capstone project.');
      }

      setProjectSuccessMsg('Capstone project submitted successfully! Reviewed deliverables will earn the verified certificate.');
      setProjectTitle('');
      setRepoUrl('');
      setDemoUrl('');
      setNotes('');
      fetchDashboard();
    } catch (err: any) {
      setProjectErrorMsg(err.message || 'Error submitting project.');
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const workshops = dashboardData?.workshops || [];
  const submissions = dashboardData?.submissions || [];
  const certificates = dashboardData?.certificates || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F386B] flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#0F172A]">Learner Dashboard</h3>
                <Badge variant="primary" size="sm">
                  {user?.role || 'Learner'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Welcome back, {user?.name} ({user?.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 bg-white shrink-0 overflow-x-auto">
          {[
            { id: 'workshops', label: 'My Cohorts', icon: Calendar, count: workshops.length },
            { id: 'resources', label: 'Materials & Prompts', icon: BookOpen },
            { id: 'submissions', label: 'Capstone Submissions', icon: Upload, count: submissions.length },
            { id: 'certificates', label: 'Certificates', icon: Award, count: certificates.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-blue-600 text-[#1F386B] font-semibold'
                    : 'border-transparent text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1F386B]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#1F386B] mx-auto" />
              <p className="text-xs text-slate-500">Loading your learner records...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: MY COHORTS */}
              {activeTab === 'workshops' && (
                <div className="space-y-4">
                  {workshops.length === 0 ? (
                    <div className="text-center py-12 space-y-3 border border-dashed border-slate-200 rounded-2xl p-6">
                      <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-sm text-[#0F172A] font-semibold">No active cohort enrollments yet.</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Choose a live cohort on the landing page and register to access live session credentials and templates.
                      </p>
                    </div>
                  ) : (
                    workshops.map((w: any) => (
                      <Card key={w.enrollmentId} className="p-5 border-slate-200 bg-slate-50 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                          <div>
                            <span className="text-[11px] font-mono text-[#1F386B] font-bold block">
                              {w.workshop.batchCode}
                            </span>
                            <h4 className="text-base font-bold text-[#0F172A] mt-0.5">{w.workshop.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#1F386B]" />
                                {w.workshop.timings}
                              </span>
                              <span>•</span>
                              <span>Mentor: {w.workshop.instructor?.name}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={w.status === 'confirmed' ? 'primary' : 'warning'} size="sm">
                              {w.status === 'confirmed' ? 'Confirmed & Active' : 'Seat Reserved (Pending Payment)'}
                            </Badge>
                          </div>
                        </div>

                        {/* Session Access Card */}
                        <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                          <div className="space-y-1 text-xs">
                            <div className="font-semibold text-[#0F172A] flex items-center gap-2">
                              <Video className="w-4 h-4 text-[#1F386B]" />
                              <span>Virtual Classroom Status: {w.sessionAccess.platform}</span>
                            </div>
                            <p className="text-slate-500 text-[11px]">
                              {w.status === 'confirmed'
                                ? 'Live screen-share and interactive labs unlock before session.'
                                : 'Complete your payment to unlock virtual meeting link and credentials.'}
                            </p>
                          </div>

                          {w.status === 'confirmed' ? (
                            <a
                              href={w.sessionAccess.joinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E41937] hover:bg-[#c5122d] text-white font-bold text-xs shrink-0"
                            >
                              <Video className="w-4 h-4" />
                              <span>Join Live Session</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <Button variant="outline" size="sm" onClick={onClose}>
                              Complete Payment
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: RESOURCES & DELIVERABLES */}
              {activeTab === 'resources' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1F386B]/[0.06] border border-[#1F386B]/20 text-xs text-[#0F172A]">
                    <strong className="block mb-1 text-[#1F386B]">Bootcamp Starter Pack:</strong>
                    Download your standardized prompt templates, project boilerplates, and automation workflows.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: '10-Prompt Enterprise Reusable Library',
                        desc: 'Structured prompt templates for JSON extraction, reasoning, and persona alignment.',
                        tag: 'Prompt Pack (PDF/MD)',
                      },
                      {
                        title: 'Grounded Assistant Instructions Template',
                        desc: 'Pre-configured system prompts and document upload evaluation matrices.',
                        tag: 'Markdown File',
                      },
                      {
                        title: 'AI Prototyping Starter (React + Vite)',
                        desc: 'Clean starter boilerplate matching the Day 2 Module 5 architecture.',
                        tag: 'GitHub Template',
                      },
                      {
                        title: 'Multi-Step Lead Automation Pipeline',
                        desc: 'Importable workflow blueprint for Make.com / n8n webhook routing.',
                        tag: 'JSON Blueprint',
                      },
                    ].map((item, idx) => (
                      <Card key={idx} className="p-5 border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                        <div>
                          <Badge variant="primary" size="sm">
                            {item.tag}
                          </Badge>
                          <h4 className="text-sm font-bold text-[#0F172A] mt-2">{item.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                          <button
                            type="button"
                            onClick={() => alert(`Downloaded: ${item.title}`)}
                            className="inline-flex items-center gap-1.5 text-xs text-[#1F386B] hover:underline font-semibold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Asset</span>
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CAPSTONE SUBMISSIONS */}
              {activeTab === 'submissions' && (
                <div className="space-y-6">
                  {projectSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-[#1F386B]/[0.06] border border-[#1F386B]/20 text-[#1F386B] text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1F386B]" />
                      <span>{projectSuccessMsg}</span>
                    </div>
                  )}

                  {projectErrorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{projectErrorMsg}</span>
                    </div>
                  )}

                  {workshops.length > 0 && (
                    <Card className="p-5 border-slate-200 bg-white shadow-sm">
                      <h4 className="text-sm font-bold text-[#0F172A] mb-3">Submit Capstone Project</h4>
                      <form
                        onSubmit={(e) => handleSubmitProject(e, workshops[0]?.enrollmentId)}
                        className="space-y-3 text-xs"
                      >
                        <div className="space-y-1">
                          <label className="text-slate-700 font-semibold">Project Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., Autonomous Support Agent & PRD Prototype"
                            value={projectTitle}
                            onChange={(e) => setProjectTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1F386B] focus:bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-slate-700 font-semibold">GitHub Repository URL</label>
                            <input
                              type="url"
                              placeholder="https://github.com/username/project"
                              value={repoUrl}
                              onChange={(e) => setRepoUrl(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1F386B] focus:bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-700 font-semibold">Live Prototype / Demo URL</label>
                            <input
                              type="url"
                              placeholder="https://my-app.netlify.app"
                              value={demoUrl}
                              onChange={(e) => setDemoUrl(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1F386B] focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-700 font-semibold">Submission Notes & Highlights</label>
                          <textarea
                            rows={2}
                            placeholder="Briefly describe what you built, which AI tools were integrated, and key challenges solved..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1F386B] focus:bg-white"
                          />
                        </div>

                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          isLoading={isSubmittingProject}
                        >
                          Submit Deliverable for Review
                        </Button>
                      </form>
                    </Card>
                  )}

                  {/* Previous Submissions List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-slate-500">Past Project Submissions</h4>
                    {submissions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No project submissions yet.</p>
                    ) : (
                      submissions.map((sub: any) => (
                        <div
                          key={sub._id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#0F172A] block">{sub.projectTitle}</span>
                            <span className="text-[11px] text-slate-500">
                              Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge variant="primary" size="sm">
                            {sub.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CERTIFICATES */}
              {activeTab === 'certificates' && (
                <div className="space-y-4">
                  {certificates.length === 0 ? (
                    <div className="text-center py-12 space-y-3 border border-dashed border-slate-200 rounded-2xl p-6">
                      <Award className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-sm text-[#0F172A] font-semibold">No certificate issued yet.</p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Attend Day 1 and Day 2 live sessions and submit your capstone deliverable to automatically receive your verifiable credential.
                      </p>
                    </div>
                  ) : (
                    certificates.map((cert: any) => (
                      <Card key={cert._id} className="p-6 border-slate-200 bg-white shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="primary" size="sm">
                                Verified Credential
                              </Badge>
                              <span className="font-mono text-xs text-[#1F386B] font-bold">
                                {cert.serialNumber}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-[#0F172A] mt-1">{cert.workshopTitle}</h4>
                            <p className="text-xs text-slate-500">Issued to: {cert.recipientName}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onOpenCertificateVerify?.(cert.serialNumber)}
                            >
                              Public Verification
                            </Button>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 break-all">
                          Cryptographic Hash: {cert.verificationHash}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

