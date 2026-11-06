import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, RefreshCw, X } from 'lucide-react';
import { useAdmin } from './AdminLayout';
import { Button } from '../../components/common/Button';

export const AdminInstructors: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    expertise: 'LLM Architecture, Prompt Engineering, RAG Systems',
    availabilityStatus: 'available',
  });

  const loadInstructors = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/instructors');
      setInstructors(res.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load instructors', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstructors();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/api/admin/instructors', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      showToast('Instructor profile saved');
      setIsModalOpen(false);
      loadInstructors();
    } catch (err: any) {
      showToast(err.message || 'Failed to save instructor', 'error');
    }
  };

  const handleAvailabilityChange = async (id: string, availabilityStatus: string) => {
    try {
      await adminFetch(`/api/admin/instructors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ availabilityStatus }),
      });
      showToast(`Instructor availability updated to ${availabilityStatus}`);
      loadInstructors();
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Instructor Management</h2>
          <p className="text-xs text-slate-500">
            Manage faculty profiles, technical expertise, biographies, scheduled cohorts, and availability.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Instructor Profile
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading faculty directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {instructors.map((inst) => (
            <div
              key={inst._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0">
                    {inst.name?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A]">{inst.name}</h3>
                    <p className="text-xs text-slate-500">{inst.email}</p>
                  </div>
                </div>

                <select
                  value={inst.availabilityStatus || 'available'}
                  onChange={(e) => handleAvailabilityChange(inst._id, e.target.value)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase border cursor-pointer ${
                    inst.availabilityStatus === 'available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : inst.availabilityStatus === 'busy'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  <option value="available">Available</option>
                  <option value="busy">In Session / Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {inst.bio || 'Staff AI Instructor & Systems Architect'}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {(inst.expertise || []).map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Assigned Batches:{' '}
                  <strong className="text-[#0F172A]">
                    {(inst.assignedBatches || []).map((b: any) => b.batchCode).join(', ') || 'All Cohorts'}
                  </strong>
                </span>
                <span className="font-bold text-blue-600">
                  {inst.scheduledSessionsCount || 2} Sessions
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-[#0F172A]">Add Instructor Profile</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. Siddharth Verma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="instructor@ailaunchpad.edu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Expertise (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.expertise}
                  onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Biography</label>
                <textarea
                  rows={3}
                  required
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="10+ years building AI systems..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Instructor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
