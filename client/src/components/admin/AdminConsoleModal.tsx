import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Users,
  DollarSign,
  TrendingUp,
  Download,
  CheckCircle2,
  Award,
  Loader2,
  Search
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshops: any[];
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  workshops,
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('');
  const [roster, setRoster] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMetrics(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch admin metrics:', err);
    }
  };

  const fetchRoster = async (workshopId: string) => {
    if (!workshopId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/roster/${workshopId}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRoster(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch roster:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMetrics();
      const initialId = workshops[0]?.id || '';
      setSelectedWorkshopId(initialId);
      if (initialId) {
        fetchRoster(initialId);
      } else {
        setIsLoading(false);
      }
    }
  }, [isOpen, workshops]);

  if (!isOpen) return null;

  const handleToggleAttendance = async (enrollmentId: string, dayNumber: number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
        body: JSON.stringify({
          enrollmentId,
          dayNumber,
          status: currentStatus ? 'absent' : 'present',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(`Attendance updated for Day ${dayNumber}.`);
        fetchRoster(selectedWorkshopId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update attendance');
    }
  };

  const handleIssueCertificate = async (enrollmentId: string) => {
    try {
      const res = await fetch('/api/admin/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
        body: JSON.stringify({ enrollmentId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(`Certificate ${data.data.serialNumber} issued successfully!`);
        fetchMetrics();
      } else {
        alert(data.message || 'Certificate issuance failed.');
      }
    } catch (err: any) {
      alert(err.message || 'Certificate issuance failed.');
    }
  };

  const handleExportCSV = () => {
    if (roster.length === 0) return;
    const headers = ['Enrollment ID', 'Name', 'Email', 'Phone', 'Category', 'Status', 'Payment', 'Day 1', 'Day 2', 'Enrolled At'];
    const rows = roster.map((r) => [
      r.enrollmentId,
      `"${r.learnerName}"`,
      r.email,
      r.phone,
      r.userCategory,
      r.status,
      r.paymentStatus,
      r.day1Attended ? 'Yes' : 'No',
      r.day2Attended ? 'Yes' : 'No',
      new Date(r.enrolledAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AILP_Roster_${selectedWorkshopId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRoster = roster.filter(
    (item) =>
      item.learnerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.enrollmentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-5xl bg-[#111827] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-[#0A0F1D] border-b border-[#1E293B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Operations & Admin Console</h3>
                <Badge variant="primary" size="sm">
                  Super Admin
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Cohort capacity, attendance tracking, revenue analytics, and certificate issuance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {actionMessage && (
            <div className="p-3.5 rounded-xl bg-blue-600/15 border border-blue-600/30 text-blue-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionMessage}</span>
              </div>
              <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-[#0A0F1D] border-[#1E293B]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Revenue</span>
                <DollarSign className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-black text-white mt-2">
                ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-blue-400 mt-1">Verified Razorpay Captured</div>
            </Card>

            <Card className="p-4 bg-[#0A0F1D] border-[#1E293B]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Registrations</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-black text-white mt-2">
                {metrics?.totalEnrollments || 0}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {metrics?.confirmedEnrollments || 0} Confirmed • {metrics?.pendingEnrollments || 0} Reserved
              </div>
            </Card>

            <Card className="p-4 bg-[#0A0F1D] border-[#1E293B]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Seat Utilization</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-black text-white mt-2">
                {metrics?.capacityFillRate || 0}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Across active cohorts</div>
            </Card>

            <Card className="p-4 bg-[#0A0F1D] border-[#1E293B]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Certificates Issued</span>
                <Award className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-black text-white mt-2">
                {metrics?.totalCertificates || 0}
              </div>
              <div className="text-[10px] text-blue-400 mt-1">Verifiable Credentials</div>
            </Card>
          </div>

          {/* Roster & Attendance Controls */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <select
                  value={selectedWorkshopId}
                  onChange={(e) => {
                    setSelectedWorkshopId(e.target.value);
                    fetchRoster(e.target.value);
                  }}
                  className="bg-[#0A0F1D] border border-[#1E293B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.batchCode} ({w.dateRange.split('–')[0]})
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search attendee or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#0A0F1D] border border-[#1E293B] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Export CSV Roster
              </Button>
            </div>

            {/* Attendees Table */}
            <div className="overflow-x-auto border border-[#1E293B] rounded-2xl bg-[#0A0F1D]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#111827] text-slate-400 font-semibold border-b border-[#1E293B] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Enrollment ID</th>
                    <th className="py-3 px-4">Participant Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Day 1 Attended</th>
                    <th className="py-3 px-4 text-center">Day 2 Attended</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] font-sans">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        Loading attendee roster...
                      </td>
                    </tr>
                  ) : filteredRoster.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No attendees registered in this batch yet.
                      </td>
                    </tr>
                  ) : (
                    filteredRoster.map((attendee) => (
                      <tr key={attendee.enrollmentId} className="hover:bg-[#111827]/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">
                          {attendee.enrollmentId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {attendee.learnerName}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {attendee.email}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={attendee.status === 'confirmed' ? 'primary' : 'warning'}
                            size="sm"
                          >
                            {attendee.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={attendee.day1Attended}
                            onChange={() =>
                              handleToggleAttendance(attendee.enrollmentId, 1, attendee.day1Attended)
                            }
                            className="w-4 h-4 rounded bg-[#0A0F1D] border-[#1E293B] text-blue-600 focus:ring-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={attendee.day2Attended}
                            onChange={() =>
                              handleToggleAttendance(attendee.enrollmentId, 2, attendee.day2Attended)
                            }
                            className="w-4 h-4 rounded bg-[#0A0F1D] border-[#1E293B] text-blue-600 focus:ring-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleIssueCertificate(attendee.enrollmentId)}
                            className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-white font-semibold"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Issue Cert</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
