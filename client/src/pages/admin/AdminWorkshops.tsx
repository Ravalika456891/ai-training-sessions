import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Archive, Trash2, Globe, EyeOff, RefreshCw, X } from 'lucide-react';
import { useAdmin } from './AdminLayout';
import { Button } from '../../components/common/Button';

export const AdminWorkshops: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
    batchCode: '',
    description:
      'Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes.',
    startDate: '2026-12-19',
    endDate: '2026-12-20',
    timings: '10:00 AM – 3:00 PM IST',
    timezone: 'Asia/Kolkata (IST)',
    capacity: 60,
    basePrice: 1999,
    instructorName: 'Vikram Malhotra',
    instructorRole: 'Staff AI Engineer & Former ML Lead',
    thumbnailUrl: '',
    status: 'published',
  });

  const loadWorkshops = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/workshops');
      setWorkshops(res.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load workshops', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkshops();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
      batchCode: `AILP-2026-B${workshops.length + 1}`,
      description:
        'Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes.',
      startDate: '2026-12-19',
      endDate: '2026-12-20',
      timings: '10:00 AM – 3:00 PM IST',
      timezone: 'Asia/Kolkata (IST)',
      capacity: 60,
      basePrice: 1999,
      instructorName: 'Vikram Malhotra',
      instructorRole: 'Staff AI Engineer & Former ML Lead',
      thumbnailUrl: '',
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: any) => {
    setEditingId(w._id);
    setForm({
      title: w.title || '',
      batchCode: w.batchCode || '',
      description: w.description || '',
      startDate: w.startDate ? new Date(w.startDate).toISOString().slice(0, 10) : '',
      endDate: w.endDate ? new Date(w.endDate).toISOString().slice(0, 10) : '',
      timings: w.timings || '10:00 AM – 3:00 PM IST',
      timezone: w.timezone || 'Asia/Kolkata (IST)',
      capacity: w.capacity || 60,
      basePrice: w.price?.basePrice ?? 1999,
      instructorName: w.instructor?.name || 'Vikram Malhotra',
      instructorRole: w.instructor?.role || 'Staff AI Engineer',
      thumbnailUrl: w.thumbnailUrl || '',
      status: w.status || 'published',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminFetch(`/api/admin/workshops/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
        showToast('Workshop updated successfully');
      } else {
        await adminFetch('/api/admin/workshops', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        showToast('New workshop cohort created');
      }
      setIsModalOpen(false);
      loadWorkshops();
    } catch (err: any) {
      showToast(err.message || 'Failed to save workshop', 'error');
    }
  };

  const handleStatusToggle = async (w: any, newStatus: string) => {
    try {
      await adminFetch(`/api/admin/workshops/${w._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Workshop ${w.batchCode} marked as ${newStatus}`);
      loadWorkshops();
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleDelete = async (w: any) => {
    if (!window.confirm(`Delete workshop ${w.batchCode}? (Workshops with enrollments cannot be deleted)`)) {
      return;
    }
    try {
      await adminFetch(`/api/admin/workshops/${w._id}`, { method: 'DELETE' });
      showToast(`Workshop ${w.batchCode} deleted`);
      loadWorkshops();
    } catch (err: any) {
      showToast(err.message || 'Cannot delete workshop with existing enrollments', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Workshop & Cohort Management</h2>
          <p className="text-xs text-slate-500">
            Create cohorts, configure pricing & capacity, assign instructors, and publish or archive batches.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Workshop Cohort
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading workshops...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workshops.map((w) => (
            <div
              key={w._id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {w.batchCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      w.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : w.status === 'archived'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>

                <h3 className="text-sm font-black text-[#0F172A]">{w.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{w.description}</p>

                <div className="pt-2 grid grid-cols-2 gap-2 text-xs border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dates</span>
                    <span className="font-semibold text-[#0F172A]">
                      {w.startDate ? new Date(w.startDate).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Price</span>
                    <span className="font-black text-blue-600">
                      ₹{w.price?.basePrice ?? 1999}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Capacity</span>
                    <span className="font-semibold text-[#0F172A]">
                      {w.enrolledCount || 0} / {w.capacity} enrolled
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Instructor</span>
                    <span className="font-semibold text-[#0F172A] truncate block">
                      {w.instructor?.name || 'Vikram Malhotra'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(w)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-xs font-semibold text-slate-700 hover:text-blue-600 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {w.status === 'published' ? (
                    <button
                      onClick={() => handleStatusToggle(w, 'draft')}
                      title="Unpublish to Draft"
                      className="p-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusToggle(w, 'published')}
                      title="Publish Workshop"
                      className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => handleStatusToggle(w, 'archived')}
                    title="Archive Workshop"
                    className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(w)}
                    title="Delete Empty Workshop"
                    className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-[#0F172A]">
                {editingId ? 'Edit Workshop Cohort' : 'Create New Workshop Cohort'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Workshop Title</label>
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
                  <label className="font-semibold text-slate-700 block mb-1">Batch Code</label>
                  <input
                    type="text"
                    required
                    value={form.batchCode}
                    onChange={(e) => setForm({ ...form, batchCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Day 1 Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Day 2 End Date</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Seat Capacity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Base Price (INR)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Instructor</label>
                  <input
                    type="text"
                    required
                    value={form.instructorName}
                    onChange={(e) => setForm({ ...form, instructorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {editingId ? 'Save Changes' : 'Create Workshop'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

