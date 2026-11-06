import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Lock, Globe, RefreshCw, X } from 'lucide-react';
import { useAdmin } from './AdminLayout';
import { Button } from '../../components/common/Button';

export const AdminContent: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [resources, setResources] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'pdf',
    description: '',
    url: '',
    workshopBatchCode: 'ALL',
    accessLevel: 'enrolled_only',
    isPublished: true,
  });

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/admin/content?category=${categoryFilter}`);
      setResources(res.data || []);
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

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Content & Learning Materials CMS</h2>
          <p className="text-xs text-slate-500">
            Manage AI prompt libraries, PDF guides, starter repositories, assignments, FAQs, and testimonials.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Content Resource
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Content' },
          { id: 'pdf', label: 'PDF Guides' },
          { id: 'prompt_template', label: 'Prompt Templates' },
          { id: 'code_repo', label: 'Code Repositories' },
          { id: 'assignment', label: 'Assignments' },
          { id: 'faq', label: 'FAQs' },
          { id: 'testimonial', label: 'Testimonials' },
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
                    <option value="faq">FAQ Item</option>
                    <option value="testimonial">Testimonial</option>
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
