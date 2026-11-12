import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock,
  Calendar,
  Video,
  Plus,
  Edit3,
  RefreshCw,
  X,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useAdmin } from './AdminLayout';
import { Button } from '../../components/common/Button';
import { normalizeMeetingUrl, isValidMeetingUrl } from '../../utils/url';

export const AdminSessions: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [persistenceNotice, setPersistenceNotice] = useState<string | null>(null);

  const [form, setForm] = useState({
    _id: '',
    workshopId: '',
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
    basePrice: 1999,
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
    fetch('/api/health', { cache: 'no-store' })
      .then((r) => r.json())
      .then((health) => {
        if (health?.isVercel && health?.dbConnected === false) {
          setPersistenceNotice(
            'Vercel is currently running without a connected MongoDB Atlas database (MONGODB_URI). New cohorts/sessions save in temporary serverless memory and can reset across requests until MONGODB_URI is added in Vercel Project Settings.'
          );
        } else {
          setPersistenceNotice(null);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenEdit = (s?: any) => {
    if (s) {
      setForm({
        _id: s._id || '',
        workshopId: s.workshopId || '',
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
        basePrice: 1999,
        registrationDeadline: s.registrationDeadline
          ? new Date(s.registrationDeadline).toISOString().slice(0, 10)
          : '2026-11-13',
        status: s.status || 'scheduled',
      });
    } else {
      setForm({
        _id: '',
        workshopId: '',
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
        basePrice: 1999,
        registrationDeadline: '2026-11-13',
        status: 'scheduled',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidMeetingUrl(form.liveSessionUrl)) {
      showToast(
        'Please enter a valid Live Meeting URL (for example https://meet.google.com/abc-defg-hij or Zoom link).',
        'error'
      );
      return;
    }

    const normalizedUrl = normalizeMeetingUrl(form.liveSessionUrl);
    setIsSaving(true);
    try {
      const endpoint = form._id ? `/api/admin/sessions/${form._id}` : '/api/admin/sessions';
      const method = form._id ? 'PATCH' : 'POST';
      await adminFetch(endpoint, {
        method,
        body: JSON.stringify({
          ...form,
          batchCode: form.batchCode.trim().toUpperCase(),
          liveSessionUrl: normalizedUrl,
        }),
      });
      showToast('Session saved & synced to public workshop registration');
      setIsModalOpen(false);
      await loadSessions();
    } catch (err: any) {
      showToast(err.message || 'Could not save session', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (session: any) => {
    if (!session?._id) return;
    try {
      await adminFetch(`/api/admin/sessions/${session._id}`, {
        method: 'DELETE',
      });
      showToast(`Removed session ${session.batchCode} Day ${session.dayNumber}`);
      await loadSessions();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete session', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0F172A]">Batch & Live Session Scheduling</h2>
          <p className="text-xs text-slate-500">
            Configure Day 1 & Day 2 live classroom links, timezones, instructor assignments, and registration deadlines.
            New batch codes automatically publish to the public workshop selector.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/admin/calendar"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F386B]/[0.06] hover:bg-[#1F386B]/10 text-[#1F386B] border border-[#1F386B]/20 text-xs font-bold transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#1F386B]" />
            <span>Open Class Calendar</span>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenEdit()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Schedule Session
          </Button>
        </div>
      </div>

      {persistenceNotice && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">Serverless Memory Mode Active on Vercel</strong>
            <span>{persistenceNotice}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B]">
          <RefreshCw className="w-5 h-5 text-[#1F386B] animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading scheduled sessions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s, idx) => {
            const safeUrl = normalizeMeetingUrl(s.liveSessionUrl);
            const urlValid = isValidMeetingUrl(safeUrl);
            return (
              <div
                key={s._id || idx}
                className="bg-white rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B] p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold text-[#1F386B] bg-[#1F386B]/[0.06] px-2.5 py-0.5 rounded-lg border border-[#1F386B]/20 truncate">
                      {s.batchCode}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                      Day {s.dayNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#1F386B]/10 text-xs font-semibold text-slate-700 hover:text-[#1F386B] cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s)}
                      title="Delete Session"
                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-[#E41937] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-black text-[#0F172A]">{s.title}</h3>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Date &amp; Time</span>
                    <span className="font-semibold text-[#0F172A]">
                      {s.sessionDate ? new Date(s.sessionDate).toLocaleDateString() : 'Scheduled'} •{' '}
                      {s.startTime} – {s.endTime}
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

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
                  {urlValid ? (
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 min-w-0 text-[#1F386B] hover:text-[#E41937] font-mono transition-colors"
                      title={safeUrl}
                    >
                      <Video className="w-4 h-4 shrink-0" />
                      <span className="truncate underline underline-offset-2">{safeUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0 text-amber-700 font-mono">
                      <Video className="w-4 h-4 shrink-0" />
                      <span className="truncate">{s.liveSessionUrl || 'No URL configured'}</span>
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-slate-500 shrink-0 ml-2">
                    Code: {s.meetingPasscode || 'AILP2026'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 border-b-[3px] border-b-[#1F386B] max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-[#1F386B]" />
                <h3 className="text-base font-black text-[#0F172A]">
                  {form._id ? 'Configure Batch Session' : 'Schedule New Batch Session'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 cursor-pointer"
              >
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
                    placeholder="AILP-2026-NOV-26"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
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

              {/* Full-width Live Meeting URL so long Google Meet / Zoom links never appear truncated */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Live Meeting URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={form.liveSessionUrl}
                    onChange={(e) => setForm({ ...form, liveSessionUrl: e.target.value })}
                    onBlur={(e) => {
                      const norm = normalizeMeetingUrl(e.target.value);
                      if (norm) setForm({ ...form, liveSessionUrl: norm });
                    }}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                  {isValidMeetingUrl(form.liveSessionUrl) && (
                    <a
                      href={normalizeMeetingUrl(form.liveSessionUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#1F386B]/10 hover:bg-[#1F386B] text-[#1F386B] hover:text-white font-bold shrink-0 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test</span>
                    </a>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Paste your real Google Meet, Zoom, or Microsoft Teams URL. https:// is added automatically if omitted.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Passcode</label>
                  <input
                    type="text"
                    value={form.meetingPasscode}
                    onChange={(e) => setForm({ ...form, meetingPasscode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
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
                  <label className="font-semibold text-slate-700 block mb-1">Deadline</label>
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
                <Button type="submit" variant="primary" size="sm" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Session'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
