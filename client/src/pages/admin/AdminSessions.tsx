import React, { useState, useEffect } from 'react';
import { CalendarClock, Video, Plus, Edit3, RefreshCw, X } from 'lucide-react';
import { useAdmin } from './AdminLayout';
import { Button } from '../../components/common/Button';

export const AdminSessions: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    _id: '',
    batchCode: 'AILP-2026-NOV-14',
    dayNumber: 1,
    title: 'Day 1: LLM Foundations, Prompt Engineering & Custom Assistants',
    sessionDate: '2026-11-14',
    startTime: '10:00 AM',
    endTime: '3:00 PM',
    timezone: 'Asia/Kolkata (IST)',
    instructorName: 'Vikram Malhotra',
    liveSessionUrl: 'https://meet.google.com/ailp-day1-cohort',
    meetingPasscode: 'AILP2026',
    capacity: 60,
    registrationDeadline: '2026-11-13',
    status: 'scheduled',
  });

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch('/api/admin/sessions');
      setSessions(res.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load sessions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleOpenEdit = (s?: any) => {
    if (s) {
      setForm({
        _id: s._id || '',
        batchCode: s.batchCode || 'AILP-2026-NOV-14',
        dayNumber: s.dayNumber || 1,
        title: s.title || '',
        sessionDate: s.sessionDate ? new Date(s.sessionDate).toISOString().slice(0, 10) : '2026-11-14',
        startTime: s.startTime || '10:00 AM',
        endTime: s.endTime || '3:00 PM',
        timezone: s.timezone || 'Asia/Kolkata (IST)',
        instructorName: s.instructorName || 'Vikram Malhotra',
        liveSessionUrl: s.liveSessionUrl || 'https://meet.google.com/ailp-day1-cohort',
        meetingPasscode: s.meetingPasscode || 'AILP2026',
        capacity: s.capacity || 60,
        registrationDeadline: s.registrationDeadline
          ? new Date(s.registrationDeadline).toISOString().slice(0, 10)
          : '2026-11-13',
        status: s.status || 'scheduled',
      });
    } else {
      setForm({
        _id: '',
        batchCode: 'AILP-2026-NOV-14',
        dayNumber: 1,
        title: 'Day 1: LLM Foundations, Prompt Engineering & Custom Assistants',
        sessionDate: '2026-11-14',
        startTime: '10:00 AM',
        endTime: '3:00 PM',
        timezone: 'Asia/Kolkata (IST)',
        instructorName: 'Vikram Malhotra',
        liveSessionUrl: 'https://meet.google.com/ailp-day1-cohort',
        meetingPasscode: 'AILP2026',
        capacity: 60,
        registrationDeadline: '2026-11-13',
        status: 'scheduled',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/api/admin/sessions', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      showToast('Batch session schedule saved');
      setIsModalOpen(false);
      loadSessions();
    } catch (err: any) {
      showToast(err.message || 'Could not save session', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Batch & Live Session Scheduling</h2>
          <p className="text-xs text-slate-500">
            Configure Day 1 & Day 2 live classroom links, timezones, instructor assignments, and registration deadlines.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleOpenEdit()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Schedule Session
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading scheduled sessions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s, idx) => (
            <div
              key={s._id || idx}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {s.batchCode}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                    Day {s.dayNumber}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-xs font-semibold text-slate-700 hover:text-blue-600 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>

              <h3 className="text-sm font-black text-[#0F172A]">{s.title}</h3>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">Date & Time</span>
                  <span className="font-semibold text-[#0F172A]">
                    {s.sessionDate ? new Date(s.sessionDate).toLocaleDateString() : 'Scheduled'} • {s.startTime} – {s.endTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Timezone</span>
                  <span className="font-semibold text-[#0F172A]">{s.timezone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Lead Instructor</span>
                  <span className="font-semibold text-[#0F172A]">{s.instructorName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Seat Capacity</span>
                  <span className="font-semibold text-[#0F172A]">{s.capacity || 60} Seats</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Video className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate font-mono text-slate-600">{s.liveSessionUrl}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 shrink-0 ml-2">
                  Code: {s.meetingPasscode || 'AILP2026'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-[#0F172A]">Configure Batch Session</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
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
                  <label className="font-semibold text-slate-700 block mb-1">Day Number</label>
                  <select
                    value={form.dayNumber}
                    onChange={(e) => setForm({ ...form, dayNumber: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value={1}>Day 1 (Saturday)</option>
                    <option value={2}>Day 2 (Sunday)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Session Date</label>
                  <input
                    type="date"
                    required
                    value={form.sessionDate}
                    onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Instructor</label>
                  <input
                    type="text"
                    required
                    value={form.instructorName}
                    onChange={(e) => setForm({ ...form, instructorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Timezone</label>
                  <input
                    type="text"
                    value={form.timezone}
                    onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Live Meeting URL</label>
                  <input
                    type="url"
                    required
                    value={form.liveSessionUrl}
                    onChange={(e) => setForm({ ...form, liveSessionUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Passcode</label>
                  <input
                    type="text"
                    value={form.meetingPasscode}
                    onChange={(e) => setForm({ ...form, meetingPasscode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Batch Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Registration Deadline</label>
                  <input
                    type="date"
                    value={form.registrationDeadline}
                    onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

