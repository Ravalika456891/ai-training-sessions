import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  ShieldAlert,
  CheckCircle2,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAdmin } from './AdminLayout';

export const AdminStudents: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [students, setStudents] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const loadStudents = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search,
        status: statusFilter,
        category: categoryFilter,
      });
      const res = await adminFetch(`/api/admin/students?${params.toString()}`);
      setStudents(res.data.students || []);
      setPagination(res.data.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 });
    } catch (err: any) {
      showToast(err.message || 'Failed to load students', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(1);
  }, [statusFilter, categoryFilter]);

  const handleViewDetails = async (id: string) => {
    try {
      const res = await adminFetch(`/api/admin/students/${id}`);
      setSelectedStudent(res.data);
    } catch (err: any) {
      showToast(err.message || 'Could not load student details', 'error');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminFetch(`/api/admin/students/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ accountStatus: newStatus }),
      });
      showToast(`Student status updated to ${newStatus}`);
      loadStudents(pagination.page);
      if (selectedStudent?.student?._id === id) {
        handleViewDetails(id);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-[#0F172A]">Student Directory</h2>
            <p className="text-xs text-slate-500">
              View learner profiles, enrollment & payment histories, and manage account access.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 self-start">
            Total Students: {pagination.total}
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadStudents(1);
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="all">All Account Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="all">All Categories</option>
            <option value="working_professional">Working Professional</option>
            <option value="student">Student</option>
            <option value="founder">Founder</option>
            <option value="creator">Creator</option>
          </select>
        </form>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading student directory...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No student records match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-4 font-semibold">Learner</th>
                  <th className="py-3 px-4 font-semibold">Phone</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Batch / Enrollments</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0F172A]">{st.name}</div>
                      <div className="text-[11px] text-slate-500">{st.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {st.phone?.number || '—'}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600">
                      {(st.userCategory || 'working_professional').replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#0F172A]">{st.latestBatch}</span>
                      <span className="text-[11px] text-slate-400 block">
                        {st.enrollmentsCount} enrollment(s)
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          st.accountStatus === 'suspended'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {st.accountStatus || 'active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => handleViewDetails(st._id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      {st.accountStatus === 'suspended' ? (
                        <button
                          onClick={() => handleStatusChange(st._id, 'active')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Activate</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(st._id, 'suspended')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold cursor-pointer"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => loadStudents(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadStudents(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-[#0F172A]">
                  {selectedStudent.student?.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedStudent.student?.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block">Account Status</span>
                <span className="font-bold text-[#0F172A] uppercase">
                  {selectedStudent.student?.accountStatus || 'active'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block">Role</span>
                <span className="font-bold text-[#0F172A] uppercase">
                  {selectedStudent.student?.role}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block">Phone</span>
                <span className="font-bold text-[#0F172A]">
                  {selectedStudent.student?.phone?.number || 'Not provided'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#0F172A] mb-2">
                Enrollment & Registration History
              </h4>
              {(selectedStudent.enrollments?.length || 0) +
                (selectedStudent.registrations?.length || 0) ===
              0 ? (
                <p className="text-xs text-slate-400">No workshop enrollments found.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {(selectedStudent.enrollments || []).map((e: any) => (
                    <div
                      key={e._id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[#0F172A]">
                          {e.workshopId?.batchCode || e.enrollmentId}
                        </span>
                        <span className="text-slate-500 block">{e.workshopId?.title}</span>
                      </div>
                      <span className="font-bold uppercase text-blue-600">{e.status}</span>
                    </div>
                  ))}
                  {(selectedStudent.registrations || []).map((r: any) => (
                    <div
                      key={r._id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[#0F172A]">Batch: {r.batchId}</span>
                        <span className="text-slate-500 block">
                          Payment: {r.paymentStatus}
                        </span>
                      </div>
                      <span className="font-bold uppercase text-emerald-600">
                        {r.registrationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

