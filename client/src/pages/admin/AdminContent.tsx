import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Lock, Globe, RefreshCw, X, Bell, CheckCircle2, ExternalLink } from 'lucide-react';
import { useAdmin } from './AdminLayout';
import { Button } from '../../components/common/Button';

export const AdminContent: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [resources, setResources] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'pdf',
    description: '',
    url: '',
    workshopBatchCode: 'ALL',
    accessLevel: 'enrolled_only',
    isPublished: true,
  });

  const [notifyForm, setNotifyForm] = useState({
    title: '',
    message: '',
    audience: 'all_students',
    workshopBatchCode: 'ALL',
  });

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const [res, assignRes] = await Promise.all([
        adminFetch(`/api/admin/content?category=${categoryFilter}`),
        adminFetch('/api/admin/assignments').catch(() => ({ data: { submissions: [] } })),
      ]);
      setResources(res.data || []);
      setSubmissions(assignRes.data?.submissions || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load content', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [categoryFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/api/admin/content', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      showToast('Content item published');
      setIsModalOpen(false);
      loadContent();
    } catch (err: any) {
      showToast(err.message || 'Failed to create content', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this content resource?')) return;
    try {
      await adminFetch(`/api/admin/content/${id}`, { method: 'DELETE' });
      showToast('Content item deleted');
      loadContent();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete content', 'error');
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify(notifyForm),
      });
      showToast('Announcement broadcast & logged');
      setIsNotifyModalOpen(false);
      setNotifyForm({ title: '', message: '', audience: 'all_students', workshopBatchCode: 'ALL' });
      loadContent();
    } catch (err: any) {
      showToast(err.message || 'Failed to broadcast announcement', 'error');
    }
  };

  const handleReviewSubmission = async (sub: any, status: 'approved' | 'under_review') => {
    const feedback =
      window.prompt(
        `Enter instructor feedback for "${sub.projectTitle}":`,
        sub.feedback || 'Great implementation! Approved for AI Launchpad graduation.'
      ) ?? '';
    try {
      await adminFetch(`/api/admin/submissions/${sub._id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status, feedback }),
      });
      showToast(`Submission marked as ${status}`);
      loadContent();
    } catch (err: any) {
      showToast(err.message || 'Could not update submission review', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">
            Content, Materials, Assignments & Notifications CMS
          </h2>
          <p className="text-xs text-slate-500">
            Manage AI prompt libraries, PDF guides, starter repositories, assignments, student submissions, announcements, FAQs, and testimonials.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNotifyModalOpen(true)}
            leftIcon={<Bell className="w-4 h-4 text-blue-600" />}
          >
            Send Announcement
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Content Resource
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Content' },
          { id: 'pdf', label: 'PDF Guides' },
          { id: 'prompt_template', label: 'Prompt Templates' },
          { id: 'code_repo', label: 'Code Repositories' },
          { id: 'assignment', label: 'Assignments' },
          { id: 'announcement', label: 'Announcements' },
          { id: 'faq', label: 'FAQs' },
          { id: 'testimonial', label: 'Testimonials' },
          { id: 'workshop_description', label: 'Website CMS' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading content library...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                    {item.category?.replace(/_/g, ' ')}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    {item.accessLevel === 'enrolled_only' ? (
                      <>
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Enrolled Students Only</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 text-emerald-600" />
                        <span>Public Website</span>
                      </>
                    )}
                  </span>
                </div>
                <h3 className="text-sm font-black text-[#0F172A]">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono truncate max-w-[240px]">
                  {item.url || 'Internal Content'}
                </span>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                  title="Delete Resource"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Assignment & Capstone Submissions Review Queue */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              Student Assignment & Capstone Submissions Review Queue
            </h3>
            <p className="text-xs text-slate-500">
              Review submitted student projects, publish instructor feedback, and approve graduation deliverables.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
            {submissions.length} Submission(s)
          </span>
        </div>

        {submissions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No student project submissions waiting for review yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3 font-semibold">Project Title</th>
                  <th className="py-2.5 px-3 font-semibold">Links</th>
                  <th className="py-2.5 px-3 font-semibold">Feedback</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub, i) => (
                  <tr key={sub._id || i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-[#0F172A]">{sub.projectTitle}</div>
                      <div className="text-[11px] text-slate-500">{sub.notes || 'Capstone Deliverable'}</div>
                    </td>
                    <td className="py-2.5 px-3 space-x-2">
                      {sub.repositoryUrl && (
                        <a
                          href={sub.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                        >
                          <span>Repo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {sub.liveDemoUrl && (
                        <a
                          href={sub.liveDemoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline"
                        >
                          <span>Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      {sub.feedback || 'Awaiting instructor feedback'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          sub.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {sub.status || 'submitted'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleReviewSubmission(sub, 'approved')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Feedback</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broadcast Notification / Announcement Modal */}
      {isNotifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-[#0F172A]">
                  Broadcast Cohort Announcement
                </h3>
              </div>
              <button
                onClick={() => setIsNotifyModalOpen(false)}
                className="p-1 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Announcement Headline
                </label>
                <input
                  type="text"
                  required
                  value={notifyForm.title}
                  onChange={(e) => setNotifyForm({ ...notifyForm, title: e.target.value })}
                  placeholder="e.g., Day 1 Live Session Starts in 1 Hour"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Audience</label>
                  <select
                    value={notifyForm.audience}
                    onChange={(e) => setNotifyForm({ ...notifyForm, audience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="all_students">Enrolled Students</option>
                    <option value="public">All Registered Users</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Cohort</label>
                  <input
                    type="text"
                    value={notifyForm.workshopBatchCode}
                    onChange={(e) =>
                      setNotifyForm({
                        ...notifyForm,
                        workshopBatchCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ALL or AILP-2026-NOV-14"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Message Content</label>
                <textarea
                  rows={3}
                  required
                  value={notifyForm.message}
                  onChange={(e) => setNotifyForm({ ...notifyForm, message: e.target.value })}
                  placeholder="Enter reminder details, schedule updates, or assignment instructions..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNotifyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Send Announcement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-[#0F172A]">Publish Content Resource</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="pdf">PDF Guide</option>
                    <option value="prompt_template">Prompt Template</option>
                    <option value="code_repo">Code Repository</option>
                    <option value="assignment">Assignment</option>
                    <option value="announcement">Announcement</option>
                    <option value="faq">FAQ Item</option>
                    <option value="testimonial">Testimonial</option>
                    <option value="workshop_description">Website CMS Section</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Access Permission</label>
                  <select
                    value={form.accessLevel}
                    onChange={(e) => setForm({ ...form, accessLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="enrolled_only">Enrolled Students Only</option>
                    <option value="public">Public Website</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Download / Repo URL</label>
                <input
                  type="text"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Content</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Publish Resource
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

