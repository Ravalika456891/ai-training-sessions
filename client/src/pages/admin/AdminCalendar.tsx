import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Video,
  UserCheck,
  AlertTriangle,
  Edit3,
  Ban,
  Repeat,
  History,
  Download,
  Eye,
  X,
  RefreshCw,
  CalendarDays,
  CalendarRange,
  LayoutList,
} from 'lucide-react';
import { useAdmin } from './AdminLayout';

export interface CalendarSession {
  _id: string;
  workshopId: string;
  workshopTitle?: string;
  batchId: string;
  batchCode: string;
  instructorId?: string;
  instructorName: string;
  dayNumber: number;
  title: string;
  description: string;
  sessionDate: string;
  startAt: string;
  endAt: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  timezone: string;
  classType: 'live' | 'recorded' | 'hybrid';
  meetingProvider: 'google_meet' | 'zoom' | 'teams' | 'custom';
  liveSessionUrl: string;
  meetingPasscode?: string;
  visibility: 'enrolled_only' | 'public_preview';
  capacity: number;
  maxAttendees: number;
  sessionResources?: string[];
  reminderMinutesBefore?: number;
  recurrenceSeriesId?: string | null;
  recurrenceRule?: {
    frequency: 'none' | 'daily' | 'weekly' | 'weekdays' | 'custom';
    interval?: number;
    daysOfWeek?: number[];
    untilDate?: string;
  };
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  cancellationReason?: string | null;
  changeHistory?: Array<{
    updatedAt: string;
    updatedBy: string;
    action: string;
    summary: string;
    previousStartAt?: string;
    previousEndAt?: string;
  }>;
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

const TIMEZONES = [
  'Asia/Kolkata',
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const WEEKDAY_LABELS = [
  { value: 0, short: 'Sun', full: 'Sunday' },
  { value: 1, short: 'Mon', full: 'Monday' },
  { value: 2, short: 'Tue', full: 'Tuesday' },
  { value: 3, short: 'Wed', full: 'Wednesday' },
  { value: 4, short: 'Thu', full: 'Thursday' },
  { value: 5, short: 'Fri', full: 'Friday' },
  { value: 6, short: 'Sat', full: 'Saturday' },
];

const STATUS_BADGE_MAP: Record<
  CalendarSession['status'],
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  draft: {
    label: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-400',
  },
  scheduled: {
    label: 'Scheduled',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-600',
  },
  live: {
    label: 'Live Now',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    dot: 'bg-emerald-500 animate-pulse',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
};

function toDateInputString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function to24HourTime(timeStr: string): string {
  if (!timeStr) return '10:00';
  const clean = timeStr.trim();
  const ampm = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1]!, 10);
    const m = ampm[2]!;
    const p = ampm[3]!.toUpperCase();
    if (p === 'AM' && h === 12) h = 0;
    if (p === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  const h24 = clean.match(/^(\d{1,2}):(\d{2})/);
  if (h24) {
    return `${String(parseInt(h24[1]!, 10)).padStart(2, '0')}:${h24[2]}`;
  }
  return '10:00';
}

function format24To12Hour(time24: string): string {
  if (!time24) return '10:00 AM';
  const parts = time24.split(':');
  const h = parseInt(parts[0] || '10', 10);
  const m = parseInt(parts[1] || '0', 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function addMinutesTo24Hour(time24: string, durationMins: number): string {
  const parts = time24.split(':');
  const h = parseInt(parts[0] || '10', 10);
  const m = parseInt(parts[1] || '0', 10);
  const total = (((h * 60 + m + durationMins) % 1440) + 1440) % 1440;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function diffMinutesBetween24Hour(start24: string, end24: string): number {
  const [sh = 10, sm = 0] = start24.split(':').map((n) => parseInt(n, 10));
  const [eh = 12, em = 0] = end24.split(':').map((n) => parseInt(n, 10));
  const diff = eh * 60 + em - (sh * 60 + sm);
  return diff > 0 ? diff : 120;
}

function generateIcsContent(session: CalendarSession): string {
  const toIcsUtc = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  const uid = `${session._id}@ailaunchpad.edu`;
  const nowUtc = toIcsUtc(new Date().toISOString());
  const dtStart = toIcsUtc(session.startAt);
  const dtEnd = toIcsUtc(session.endAt);
  const statusLine = session.status === 'cancelled' ? 'STATUS:CANCELLED' : 'STATUS:CONFIRMED';
  const desc = `${session.description || ''}\\nBatch: ${session.batchCode}\\nInstructor: ${
    session.instructorName
  }\\nMeeting URL: ${session.liveSessionUrl || 'See Student Dashboard'}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Launchpad//Class Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${session.title} (${session.batchCode})`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${session.liveSessionUrl || 'Online Live Classroom'}`,
    statusLine,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export const AdminCalendar: React.FC = () => {
  const { adminFetch, showToast } = useAdmin();

  // Data state
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar View & Navigation state
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date('2026-11-14T10:00:00'));

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [workshopFilter, setWorkshopFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classTypeFilter, setClassTypeFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<CalendarSession | null>(null);
  const [inspectingSession, setInspectingSession] = useState<CalendarSession | null>(null);
  const [cancellingSession, setCancellingSession] = useState<CalendarSession | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelScope, setCancelScope] = useState<'single' | 'future' | 'series'>('single');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Add/Edit Form state
  const [formData, setFormData] = useState({
    title: '',
    workshopId: '',
    batchCode: 'AILP-2026-NOV-14',
    instructorName: 'Vikram Malhotra',
    instructorId: 'inst_1',
    sessionDate: '2026-11-14',
    startTime24: '10:00',
    endTime24: '12:00',
    durationMinutes: 120,
    timezone: 'Asia/Kolkata',
    meetingProvider: 'google_meet' as 'google_meet' | 'zoom' | 'teams' | 'custom',
    liveSessionUrl: 'https://meet.google.com/ailp-live-class',
    meetingPasscode: 'AILP2026',
    description: '',
    classType: 'live' as 'live' | 'recorded' | 'hybrid',
    visibility: 'enrolled_only' as 'enrolled_only' | 'public_preview',
    status: 'scheduled' as 'draft' | 'scheduled' | 'live' | 'completed',
    maxAttendees: 60,
    sessionResources: '',
    reminderMinutesBefore: 30,
    allowPastCorrection: false,
    editScope: 'single' as 'single' | 'future' | 'series',
    // Recurrence settings
    isRecurring: false,
    recurrenceFrequency: 'weekly' as 'daily' | 'weekly' | 'weekdays',
    recurrenceInterval: 1,
    recurrenceDaysOfWeek: [1, 3, 5] as number[],
    recurrenceUntilDate: '2026-12-05',
  });

  // Recurring preview state
  const [recurringPreview, setRecurringPreview] = useState<any[] | null>(null);
  const [recurringConflictCount, setRecurringConflictCount] = useState(0);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const [sesRes, wsRes, instRes] = await Promise.all([
        adminFetch('/api/admin/calendar/sessions'),
        adminFetch('/api/admin/workshops'),
        adminFetch('/api/admin/instructors'),
      ]);
      const loadedSessions: CalendarSession[] = sesRes.data || [];
      setSessions(loadedSessions);
      setWorkshops(wsRes.data || []);
      setInstructors(instRes.data || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load class calendar', 'error');
    } finally {
      setLoading(false);
    }
  }, [adminFetch, showToast]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Unique batch codes & instructor names for filter dropdowns
  const batchOptions = useMemo(() => {
    const set = new Set<string>();
    workshops.forEach((w) => {
      if (w.batchCode) set.add(w.batchCode);
    });
    sessions.forEach((s) => {
      if (s.batchCode) set.add(s.batchCode);
    });
    if (set.size === 0) set.add('AILP-2026-NOV-14');
    return Array.from(set);
  }, [workshops, sessions]);

  const instructorOptions = useMemo(() => {
    const set = new Set<string>();
    instructors.forEach((i) => {
      if (i.name) set.add(i.name);
    });
    workshops.forEach((w) => {
      if (w.instructor?.name) set.add(w.instructor.name);
    });
    sessions.forEach((s) => {
      if (s.instructorName) set.add(s.instructorName);
    });
    if (set.size === 0) set.add('Vikram Malhotra');
    return Array.from(set);
  }, [instructors, workshops, sessions]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (
        workshopFilter !== 'all' &&
        s.workshopId !== workshopFilter &&
        s.batchCode !== workshopFilter
      ) {
        return false;
      }
      if (batchFilter !== 'all' && s.batchCode !== batchFilter) {
        return false;
      }
      if (
        instructorFilter !== 'all' &&
        s.instructorName.toLowerCase() !== instructorFilter.toLowerCase()
      ) {
        return false;
      }
      if (statusFilter !== 'all' && s.status !== statusFilter) {
        return false;
      }
      if (classTypeFilter !== 'all' && s.classType !== classTypeFilter) {
        return false;
      }
      if (dateFromFilter) {
        const fromMs = new Date(`${dateFromFilter}T00:00:00`).getTime();
        if (new Date(s.endAt || s.startAt).getTime() < fromMs) return false;
      }
      if (dateToFilter) {
        const toMs = new Date(`${dateToFilter}T23:59:59`).getTime();
        if (new Date(s.startAt).getTime() > toMs) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hay = `${s.title} ${s.description} ${s.batchCode} ${s.instructorName} ${s.workshopTitle || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    sessions,
    workshopFilter,
    batchFilter,
    instructorFilter,
    statusFilter,
    classTypeFilter,
    dateFromFilter,
    dateToFilter,
    searchQuery,
  ]);

  // Navigation handlers
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  // Open Add Class modal (optionally pre-filled with clicked date/time)
  const openCreateModal = (prefillDate?: Date, prefillHour?: number) => {
    const targetDate = prefillDate || new Date( Date.now() + 86400000 );
    const dateStr = toDateInputString(targetDate);
    const startH = prefillHour !== undefined ? prefillHour : 10;
    const start24 = `${String(startH).padStart(2, '0')}:00`;
    const end24 = addMinutesTo24Hour(start24, 120);
    const defaultWs = workshops[0];

    setEditingSession(null);
    setFormError(null);
    setRecurringPreview(null);
    setFormData({
      title: '',
      workshopId: defaultWs?._id || '',
      batchCode: defaultWs?.batchCode || batchOptions[0] || 'AILP-2026-NOV-14',
      instructorName: defaultWs?.instructor?.name || instructorOptions[0] || 'Vikram Malhotra',
      instructorId: 'inst_1',
      sessionDate: dateStr,
      startTime24: start24,
      endTime24: end24,
      durationMinutes: 120,
      timezone: 'Asia/Kolkata',
      meetingProvider: 'google_meet',
      liveSessionUrl: 'https://meet.google.com/ailp-live-session',
      meetingPasscode: 'AILP2026',
      description: '',
      classType: 'live',
      visibility: 'enrolled_only',
      status: 'scheduled',
      maxAttendees: defaultWs?.capacity || 60,
      sessionResources: '',
      reminderMinutesBefore: 30,
      allowPastCorrection: false,
      editScope: 'single',
      isRecurring: false,
      recurrenceFrequency: 'weekly',
      recurrenceInterval: 1,
      recurrenceDaysOfWeek: [targetDate.getDay()],
      recurrenceUntilDate: toDateInputString(new Date(targetDate.getTime() + 21 * 86400000)),
    });
    setIsFormOpen(true);
  };

  // Open Edit / Reschedule modal
  const openEditModal = (session: CalendarSession) => {
    const d = new Date(session.startAt || session.sessionDate);
    const start24 = to24HourTime(session.startTime);
    const dur = session.durationMinutes || 120;
    const end24 = session.endTime ? to24HourTime(session.endTime) : addMinutesTo24Hour(start24, dur);

    setInspectingSession(null);
    setEditingSession(session);
    setFormError(null);
    setRecurringPreview(null);
    setFormData({
      title: session.title,
      workshopId: session.workshopId || '',
      batchCode: session.batchCode,
      instructorName: session.instructorName,
      instructorId: session.instructorId || 'inst_1',
      sessionDate: toDateInputString(d),
      startTime24: start24,
      endTime24: end24,
      durationMinutes: dur,
      timezone: session.timezone.replace(/\s*\(.*?\)\s*$/, '') || 'Asia/Kolkata',
      meetingProvider: session.meetingProvider || 'google_meet',
      liveSessionUrl: session.liveSessionUrl || '',
      meetingPasscode: session.meetingPasscode || '',
      description: session.description || '',
      classType: session.classType || 'live',
      visibility: session.visibility || 'enrolled_only',
      status: session.status === 'cancelled' ? 'scheduled' : session.status,
      maxAttendees: session.maxAttendees || session.capacity || 60,
      sessionResources: (session.sessionResources || []).join(', '),
      reminderMinutesBefore: session.reminderMinutesBefore || 30,
      allowPastCorrection: true,
      editScope: 'single',
      isRecurring: false,
      recurrenceFrequency: 'weekly',
      recurrenceInterval: 1,
      recurrenceDaysOfWeek: [d.getDay()],
      recurrenceUntilDate: toDateInputString(new Date(d.getTime() + 21 * 86400000)),
    });
    setIsFormOpen(true);
  };

  // Preview Recurring Sessions
  const handlePreviewRecurring = async () => {
    setFormError(null);
    setLoadingPreview(true);
    try {
      const res = await adminFetch('/api/admin/calendar/recurring', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title || 'Recurring Training Class',
          description: formData.description,
          workshopId: formData.workshopId || formData.batchCode,
          batchCode: formData.batchCode,
          instructorName: formData.instructorName,
          sessionDate: formData.sessionDate,
          startTime: format24To12Hour(formData.startTime24),
          endTime: format24To12Hour(formData.endTime24),
          durationMinutes: formData.durationMinutes,
          timezone: formData.timezone,
          classType: formData.classType,
          meetingProvider: formData.meetingProvider,
          liveSessionUrl: formData.liveSessionUrl,
          meetingPasscode: formData.meetingPasscode,
          visibility: formData.visibility,
          status: formData.status,
          maxAttendees: formData.maxAttendees,
          previewOnly: true,
          recurrenceRule: {
            frequency: formData.recurrenceFrequency,
            interval: formData.recurrenceInterval,
            daysOfWeek: formData.recurrenceDaysOfWeek,
            untilDate: formData.recurrenceUntilDate,
          },
        }),
      });
      setRecurringPreview(res.data || []);
      setRecurringConflictCount(res.conflictCount || 0);
    } catch (err: any) {
      setFormError(err.message || 'Failed to generate recurring preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Save Class (Create, Recurring Create, or Update/Reschedule)
  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Class Title is required.');
      return;
    }
    if (!formData.batchCode.trim()) {
      setFormError('Workshop / Batch selection is required.');
      return;
    }
    if (!formData.instructorName.trim()) {
      setFormError('Instructor name is required.');
      return;
    }
    if (!formData.liveSessionUrl.trim()) {
      setFormError('Meeting URL is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        workshopId: formData.workshopId || formData.batchCode,
        batchCode: formData.batchCode.trim().toUpperCase(),
        instructorId: formData.instructorId,
        instructorName: formData.instructorName.trim(),
        sessionDate: formData.sessionDate,
        startTime: format24To12Hour(formData.startTime24),
        endTime: format24To12Hour(formData.endTime24),
        durationMinutes: Number(formData.durationMinutes),
        timezone: formData.timezone,
        classType: formData.classType,
        meetingProvider: formData.meetingProvider,
        liveSessionUrl: formData.liveSessionUrl.trim(),
        meetingPasscode: formData.meetingPasscode.trim(),
        visibility: formData.visibility,
        status: formData.status,
        maxAttendees: Number(formData.maxAttendees) || 60,
        sessionResources: formData.sessionResources
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        reminderMinutesBefore: Number(formData.reminderMinutesBefore) || 30,
        allowPastCorrection: formData.allowPastCorrection,
        scope: formData.editScope,
      };

      if (editingSession) {
        const res = await adminFetch(`/api/admin/calendar/sessions/${editingSession._id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        showToast(res.message || 'Class updated successfully');
      } else if (formData.isRecurring) {
        const res = await adminFetch('/api/admin/calendar/recurring', {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            previewOnly: false,
            recurrenceRule: {
              frequency: formData.recurrenceFrequency,
              interval: formData.recurrenceInterval,
              daysOfWeek: formData.recurrenceDaysOfWeek,
              untilDate: formData.recurrenceUntilDate,
            },
          }),
        });
        showToast(res.message || `Scheduled ${res.count} recurring classes`);
      } else {
        const res = await adminFetch('/api/admin/calendar/sessions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast(res.message || 'Class scheduled successfully');
      }

      // Jump calendar to the scheduled date so admin sees it immediately
      setCurrentDate(new Date(`${formData.sessionDate}T10:00:00`));
      setIsFormOpen(false);
      await loadCalendarData();
    } catch (err: any) {
      setFormError(err.message || 'Unable to save class due to scheduling conflict or validation error.');
      showToast(err.message || 'Failed to save class', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Session
  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSession) return;
    setSubmitting(true);
    try {
      const res = await adminFetch(`/api/admin/calendar/sessions/${cancellingSession._id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({
          reason: cancelReason.trim() || 'Cancelled by administrator',
          scope: cancelScope,
        }),
      });
      showToast(res.message || 'Class cancelled and retained in calendar history.');
      setCancellingSession(null);
      setInspectingSession(null);
      setCancelReason('');
      await loadCalendarData();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel session', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Download .ics file
  const handleDownloadIcs = (session: CalendarSession) => {
    const ics = generateIcsContent(session);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.batchCode}-${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Month grid generator
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startOffset = firstDayOfMonth.getDay();
    const totalCells = Math.ceil((startOffset + lastDayOfMonth.getDate()) / 7) * 7;

    const cells: Array<{ date: Date; isCurrentMonth: boolean; dateKey: string }> = [];
    for (let i = 0; i < totalCells; i++) {
      const cellDate = new Date(year, month, 1 - startOffset + i);
      cells.push({
        date: cellDate,
        isCurrentMonth: cellDate.getMonth() === month,
        dateKey: toDateInputString(cellDate),
      });
    }
    return cells;
  }, [currentDate]);

  // Week days generator
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      return {
        date: d,
        dateKey: toDateInputString(d),
      };
    });
  }, [currentDate]);

  // Group filtered sessions by local YYYY-MM-DD key
  const sessionsByDateKey = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();
    filteredSessions.forEach((s) => {
      const d = new Date(s.startAt || s.sessionDate);
      const key = toDateInputString(d);
      const list = map.get(key) || [];
      list.push(s);
      map.set(key, list);
    });
    return map;
  }, [filteredSessions]);

  const todayKey = toDateInputString(new Date());

  // Summary counts
  const stats = useMemo(() => {
    return {
      total: filteredSessions.length,
      scheduled: filteredSessions.filter((s) => s.status === 'scheduled').length,
      live: filteredSessions.filter((s) => s.status === 'live').length,
      completed: filteredSessions.filter((s) => s.status === 'completed').length,
      cancelled: filteredSessions.filter((s) => s.status === 'cancelled').length,
      draft: filteredSessions.filter((s) => s.status === 'draft').length,
    };
  }, [filteredSessions]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            Anytime Class Scheduling & Conflict Engine
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Class Calendar & Schedule Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Schedule live, hybrid, or recorded classes on any date and time with automatic instructor, batch, and meeting room conflict detection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadCalendarData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => openCreateModal()}
            data-testid="add-class-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Class
          </button>
        </div>
      </div>

      {/* Status Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Classes', count: stats.total, color: 'text-slate-900', bg: 'bg-white' },
          { label: 'Scheduled', count: stats.scheduled, color: 'text-blue-700', bg: 'bg-blue-50/60' },
          { label: 'Live Now', count: stats.live, color: 'text-emerald-700', bg: 'bg-emerald-50/60' },
          { label: 'Completed', count: stats.completed, color: 'text-indigo-700', bg: 'bg-indigo-50/60' },
          { label: 'Drafts', count: stats.draft, color: 'text-slate-700', bg: 'bg-slate-100/70' },
          { label: 'Cancelled', count: stats.cancelled, color: 'text-rose-700', bg: 'bg-rose-50/60' },
        ].map((item) => (
          <div
            key={item.label}
            className={`${item.bg} rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {item.label}
            </span>
            <span className={`text-2xl font-black mt-1 ${item.color}`}>{item.count}</span>
          </div>
        ))}
      </div>

      {/* Calendar Controls & Filters Toolbar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top Row: View Switcher + Date Navigation + Date Picker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-[#0F172A] cursor-pointer"
            >
              Today
            </button>
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous period"
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next period"
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base sm:text-lg font-black text-[#0F172A] ml-1">
              {viewMode === 'month' &&
                currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {viewMode === 'week' &&
                `Week of ${weekDays[0]!.date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })} – ${weekDays[6]!.date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}`}
              {viewMode === 'day' &&
                currentDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              {viewMode === 'agenda' && 'All Scheduled Classes (Agenda View)'}
            </h3>

            {/* Jump to Date Picker */}
            <input
              type="date"
              aria-label="Jump to date"
              value={toDateInputString(currentDate)}
              onChange={(e) => {
                if (e.target.value) {
                  setCurrentDate(new Date(`${e.target.value}T10:00:00`));
                }
              }}
              className="ml-auto md:ml-2 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto">
            {(
              [
                { id: 'month', label: 'Month', icon: CalendarDays },
                { id: 'week', label: 'Week', icon: CalendarRange },
                { id: 'day', label: 'Day', icon: Clock },
                { id: 'agenda', label: 'Agenda / List', icon: LayoutList },
              ] as const
            ).map((v) => {
              const Icon = v.icon;
              const active = viewMode === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setViewMode(v.id)}
                  className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Second Row: Search & Multi-Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, batch, instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            aria-label="Filter by Batch"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Batches</option>
            {batchOptions.map((b) => (
              <option key={b} value={b}>
                Batch: {b}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Instructor"
            value={instructorFilter}
            onChange={(e) => setInstructorFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Instructors</option>
            {instructorOptions.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            aria-label="Filter by Class Type"
            value={classTypeFilter}
            onChange={(e) => setClassTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Class Types</option>
            <option value="live">Live Interactive</option>
            <option value="hybrid">Hybrid</option>
            <option value="recorded">Recorded</option>
          </select>
        </div>

        {/* Third Row: Workshop Filter & Date Range Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <select
            aria-label="Filter by Workshop"
            value={workshopFilter}
            onChange={(e) => setWorkshopFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Workshops</option>
            {workshops.map((w) => (
              <option key={w._id} value={w._id}>
                {w.title} ({w.batchCode})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">From:</span>
            <input
              type="date"
              aria-label="Filter from date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">To:</span>
            <input
              type="date"
              aria-label="Filter to date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
            />
            {(dateFromFilter || dateToFilter || workshopFilter !== 'all' || batchFilter !== 'all' || instructorFilter !== 'all' || statusFilter !== 'all' || classTypeFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setWorkshopFilter('all');
                  setBatchFilter('all');
                  setInstructorFilter('all');
                  setStatusFilter('all');
                  setClassTypeFilter('all');
                  setDateFromFilter('');
                  setDateToFilter('');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 shrink-0 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: MONTH VIEW
      ===================================================================== */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {WEEKDAY_LABELS.map((d) => (
                  <div
                    key={d.short}
                    className="py-2.5 text-center text-[11px] font-extrabold uppercase tracking-wider text-slate-500"
                  >
                    {d.short}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
                {monthDays.map((cell) => {
                  const daySessions = sessionsByDateKey.get(cell.dateKey) || [];
                  const isToday = cell.dateKey === todayKey;

                  return (
                    <div
                      key={cell.dateKey}
                      onClick={() => openCreateModal(cell.date)}
                      className={`min-h-[120px] sm:min-h-[140px] p-2 transition-colors hover:bg-blue-50/30 cursor-pointer flex flex-col ${
                        cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                            isToday
                              ? 'bg-blue-600 text-white shadow-xs'
                              : cell.isCurrentMonth
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>
                        {daySessions.length > 0 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            {daySessions.length} {daySessions.length === 1 ? 'class' : 'classes'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        {daySessions.map((ses) => {
                          const badge = STATUS_BADGE_MAP[ses.status] || STATUS_BADGE_MAP.scheduled;
                          return (
                            <div
                              key={ses._id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectingSession(ses);
                              }}
                              className={`p-1.5 rounded-xl border text-left transition-all hover:shadow-xs ${badge.bg} ${badge.border} ${
                                ses.status === 'cancelled' ? 'opacity-65 line-through' : ''
                              }`}
                            >
                              <div className="flex items-center gap-1 text-[10px] font-extrabold">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                                <span className={`truncate ${badge.text}`}>{ses.startTime}</span>
                              </div>
                              <div className="text-[11px] font-bold text-[#0F172A] truncate mt-0.5">
                                {ses.title}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {ses.batchCode} • {ses.instructorName}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: WEEK VIEW
      ===================================================================== */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 divide-x divide-slate-200">
              {weekDays.map((wd) => {
                const isToday = wd.dateKey === todayKey;
                return (
                  <div key={wd.dateKey} className="p-3 text-center">
                    <div className="text-[11px] font-bold uppercase text-slate-500">
                      {wd.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div
                      className={`mt-1 inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-black ${
                        isToday ? 'bg-blue-600 text-white' : 'text-[#0F172A]'
                      }`}
                    >
                      {wd.date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 divide-x divide-slate-200 min-h-[420px]">
              {weekDays.map((wd) => {
                const daySessions = sessionsByDateKey.get(wd.dateKey) || [];
                return (
                  <div
                    key={wd.dateKey}
                    onClick={() => openCreateModal(wd.date, 10)}
                    className="p-2.5 space-y-2 hover:bg-blue-50/20 cursor-pointer"
                  >
                    {daySessions.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[11px] text-slate-300 font-medium py-12">
                        + Click to schedule
                      </div>
                    ) : (
                      daySessions.map((ses) => {
                        const badge = STATUS_BADGE_MAP[ses.status] || STATUS_BADGE_MAP.scheduled;
                        return (
                          <div
                            key={ses._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingSession(ses);
                            }}
                            className={`p-2.5 rounded-2xl border ${badge.bg} ${badge.border} shadow-2xs hover:shadow-md transition-all`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-[10px] font-extrabold ${badge.text}`}>
                                {ses.startTime} – {ses.endTime}
                              </span>
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/80 text-slate-700">
                                {ses.classType}
                              </span>
                            </div>
                            <p
                              className={`text-xs font-extrabold text-[#0F172A] mt-1 ${
                                ses.status === 'cancelled' ? 'line-through opacity-70' : ''
                              }`}
                            >
                              {ses.title}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-1 font-medium">
                              {ses.batchCode}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {ses.instructorName}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 3: DAY VIEW (Hourly Time Slots + Anytime Sessions)
      ===================================================================== */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-black text-[#0F172A]">
                Schedule for {currentDate.toDateString()}
              </h4>
              <p className="text-xs text-slate-500">
                Click any hour slot below to schedule a class starting at that time, or click an existing session to inspect/edit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreateModal(currentDate, 10)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              + Schedule on This Day
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((hour) => {
              const dayKey = toDateInputString(currentDate);
              const daySessions = (sessionsByDateKey.get(dayKey) || []).filter((s) => {
                const t24 = to24HourTime(s.startTime);
                const sh = parseInt(t24.split(':')[0] || '10', 10);
                return sh === hour;
              });

              return (
                <div
                  key={hour}
                  onClick={() => openCreateModal(currentDate, hour)}
                  className="py-3 px-3 flex items-start gap-4 hover:bg-blue-50/30 cursor-pointer rounded-xl transition-colors"
                >
                  <div className="w-20 shrink-0 text-xs font-bold text-slate-500 pt-1">
                    {format24To12Hour(`${String(hour).padStart(2, '0')}:00`)}
                  </div>
                  <div className="flex-1 space-y-2">
                    {daySessions.length === 0 ? (
                      <span className="text-xs text-slate-300 font-medium">
                        Available slot — click to schedule class
                      </span>
                    ) : (
                      daySessions.map((ses) => {
                        const badge = STATUS_BADGE_MAP[ses.status] || STATUS_BADGE_MAP.scheduled;
                        return (
                          <div
                            key={ses._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingSession(ses);
                            }}
                            className={`p-3 rounded-2xl border ${badge.bg} ${badge.border} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-extrabold ${badge.text}`}>
                                  {ses.startTime} – {ses.endTime} ({ses.durationMinutes} mins)
                                </span>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                                  {badge.label}
                                </span>
                              </div>
                              <h5 className="text-sm font-black text-[#0F172A] mt-1">{ses.title}</h5>
                              <p className="text-xs text-slate-600">
                                Batch: <span className="font-bold">{ses.batchCode}</span> • Instructor:{' '}
                                <span className="font-bold">{ses.instructorName}</span> • Timezone:{' '}
                                {ses.timezone}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(ses);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                              >
                                Edit / Reschedule
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 4: AGENDA / LIST VIEW
      ===================================================================== */}
      {viewMode === 'agenda' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No classes match your filters</h4>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing filters or click &ldquo;Add Class&rdquo; to schedule a new training session.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredSessions.map((ses) => {
                const badge = STATUS_BADGE_MAP[ses.status] || STATUS_BADGE_MAP.scheduled;
                const d = new Date(ses.startAt || ses.sessionDate);
                return (
                  <div
                    key={ses._id}
                    className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 shrink-0 rounded-2xl bg-slate-100 border border-slate-200 p-2 text-center">
                        <div className="text-[10px] font-bold uppercase text-blue-600">
                          {d.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-xl font-black text-[#0F172A]">{d.getDate()}</div>
                        <div className="text-[10px] font-semibold text-slate-500">
                          {d.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase">
                            {ses.classType}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                            {ses.batchCode}
                          </span>
                          {ses.recurrenceSeriesId && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold">
                              <Repeat className="w-3 h-3" />
                              Recurring Series
                            </span>
                          )}
                        </div>

                        <h4
                          className={`text-base font-black text-[#0F172A] ${
                            ses.status === 'cancelled' ? 'line-through opacity-70' : ''
                          }`}
                        >
                          {ses.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            {ses.startTime} – {ses.endTime} ({ses.durationMinutes}m • {ses.timezone})
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {ses.instructorName}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Video className="w-3.5 h-3.5 text-indigo-600" />
                            {ses.meetingProvider.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        {ses.cancellationReason && (
                          <p className="text-xs text-rose-600 font-semibold">
                            Cancellation Reason: {ses.cancellationReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                      <button
                        type="button"
                        onClick={() => setInspectingSession(ses)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(ses)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit / Reschedule
                      </button>
                      {ses.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancellingSession(ses);
                            setCancelReason('');
                            setCancelScope('single');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODAL 1: ADD / EDIT / RESCHEDULE CLASS FORM
      ===================================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-black text-[#0F172A]">
                  {editingSession ? 'Edit / Reschedule Training Class' : 'Schedule New Training Class'}
                </h3>
                <p className="text-xs text-slate-500">
                  Anytime scheduling with automatic backend instructor, batch, and meeting room conflict verification.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveSession} className="p-6 overflow-y-auto space-y-5 flex-1">
              {formError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Recurring Edit Scope selector when editing an existing recurring session */}
              {editingSession?.recurrenceSeriesId && (
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-purple-900">
                    <Repeat className="w-4 h-4 text-purple-600" />
                    <span>Recurring Series Edit Scope</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold text-purple-800">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="editScope"
                        checked={formData.editScope === 'single'}
                        onChange={() => setFormData({ ...formData, editScope: 'single' })}
                      />
                      This occurrence only
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="editScope"
                        checked={formData.editScope === 'future'}
                        onChange={() => setFormData({ ...formData, editScope: 'future' })}
                      />
                      This and future occurrences
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="editScope"
                        checked={formData.editScope === 'series'}
                        onChange={() => setFormData({ ...formData, editScope: 'series' })}
                      />
                      Entire recurring series
                    </label>
                  </div>
                </div>
              )}

              {/* Title & Workshop/Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Agentic RAG Systems & Multi-Agent Orchestration Lab"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Workshop / Cohort *
                  </label>
                  <select
                    value={formData.workshopId}
                    onChange={(e) => {
                      const ws = workshops.find((w) => w._id === e.target.value);
                      setFormData({
                        ...formData,
                        workshopId: e.target.value,
                        batchCode: ws?.batchCode || formData.batchCode,
                        instructorName: ws?.instructor?.name || formData.instructorName,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="">Select Workshop Cohort</option>
                    {workshops.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.title} ({w.batchCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch Code *
                  </label>
                  <input
                    type="text"
                    required
                    list="calendar-batch-list"
                    placeholder="e.g., AILP-2026-NOV-14"
                    value={formData.batchCode}
                    onChange={(e) =>
                      setFormData({ ...formData, batchCode: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                  <datalist id="calendar-batch-list">
                    {batchOptions.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instructor *
                  </label>
                  <input
                    type="text"
                    required
                    list="calendar-instructor-list"
                    placeholder="Select or type instructor name"
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                  <datalist id="calendar-instructor-list">
                    {instructorOptions.map((inst) => (
                      <option key={inst} value={inst} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Timezone (IANA) *
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date, Anytime Time Picker (with 12h AM/PM Display) & Duration */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Date & Anytime Time Picker (12-Hour AM/PM Synchronized)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Morning 9:00 AM', t: '09:00' },
                      { label: 'Late Morning 11:00 AM', t: '11:00' },
                      { label: 'Afternoon 2:30 PM', t: '14:30' },
                      { label: 'Evening 6:30 PM', t: '18:30' },
                      { label: 'Night 8:30 PM', t: '20:30' },
                    ].map((preset) => (
                      <button
                        key={preset.t}
                        type="button"
                        onClick={() => {
                          const end24 = addMinutesTo24Hour(preset.t, formData.durationMinutes);
                          setFormData({ ...formData, startTime24: preset.t, endTime24: end24 });
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-[10px] font-bold text-slate-700 cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Class Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.sessionDate}
                      onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Start Time ({format24To12Hour(formData.startTime24)}) *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.startTime24}
                      onChange={(e) => {
                        const nextStart = e.target.value;
                        const nextEnd = addMinutesTo24Hour(nextStart, formData.durationMinutes);
                        setFormData({
                          ...formData,
                          startTime24: nextStart,
                          endTime24: nextEnd,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      End Time ({format24To12Hour(formData.endTime24)}) *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.endTime24}
                      onChange={(e) => {
                        const nextEnd = e.target.value;
                        const calcDur = diffMinutesBetween24Hour(formData.startTime24, nextEnd);
                        setFormData({
                          ...formData,
                          endTime24: nextEnd,
                          durationMinutes: calcDur,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Duration (Minutes) *
                    </label>
                    <input
                      type="number"
                      min={15}
                      max={720}
                      step={5}
                      required
                      value={formData.durationMinutes}
                      onChange={(e) => {
                        const dur = Math.max(5, parseInt(e.target.value || '60', 10));
                        const nextEnd = addMinutesTo24Hour(formData.startTime24, dur);
                        setFormData({
                          ...formData,
                          durationMinutes: dur,
                          endTime24: nextEnd,
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Authorized Past-Date Correction Checkbox */}
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.allowPastCorrection}
                    onChange={(e) =>
                      setFormData({ ...formData, allowPastCorrection: e.target.checked })
                    }
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>
                    Authorized Historical / Past-Date Schedule Correction (enable only when logging a past session)
                  </span>
                </label>
              </div>

              {/* Meeting Provider, URL, Class Type, Visibility, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meeting Provider *
                  </label>
                  <select
                    value={formData.meetingProvider}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meetingProvider: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="custom">Custom Stream / WebRTC</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Protected Meeting URL (Hidden from unpaid users) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://meet.google.com/..."
                    value={formData.liveSessionUrl}
                    onChange={(e) => setFormData({ ...formData, liveSessionUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Type *
                  </label>
                  <select
                    value={formData.classType}
                    onChange={(e) =>
                      setFormData({ ...formData, classType: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="live">Live Interactive</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="recorded">Recorded Release</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enrollment Visibility *
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) =>
                      setFormData({ ...formData, visibility: e.target.value as any })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="enrolled_only">Enrolled Only (Preview title publicly)</option>
                    <option value="public_preview">Public Schedule Preview</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="scheduled">Scheduled (Published)</option>
                    <option value="draft">Draft (Internal Only)</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Description & Optional Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Class Description & Agenda
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Topics covered, prerequisites, and hands-on lab goals..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxAttendees}
                    onChange={(e) =>
                      setFormData({ ...formData, maxAttendees: parseInt(e.target.value || '60', 10) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reminder Alert Before
                  </label>
                  <select
                    value={formData.reminderMinutesBefore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reminderMinutesBefore: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                    <option value={60}>1 hour before</option>
                    <option value={1440}>24 hours before</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meeting Passcode (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.meetingPasscode}
                    onChange={(e) =>
                      setFormData({ ...formData, meetingPasscode: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Recurrence Generator (Only when creating a new class) */}
              {!editingSession && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0F172A] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => {
                          setFormData({ ...formData, isRecurring: e.target.checked });
                          setRecurringPreview(null);
                        }}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <Repeat className="w-4 h-4 text-blue-600" />
                      <span>Repeat / Recurring Class Series</span>
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Recurrence Pattern
                          </label>
                          <select
                            value={formData.recurrenceFrequency}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                recurrenceFrequency: e.target.value as any,
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly on Selected Days</option>
                            <option value="weekdays">Selected Weekdays</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Repeat Until Date *
                          </label>
                          <input
                            type="date"
                            value={formData.recurrenceUntilDate}
                            onChange={(e) =>
                              setFormData({ ...formData, recurrenceUntilDate: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handlePreviewRecurring}
                            disabled={loadingPreview}
                            className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                          >
                            {loadingPreview ? 'Checking Conflicts...' : 'Preview Generated Sessions'}
                          </button>
                        </div>
                      </div>

                      {formData.recurrenceFrequency !== 'daily' && (
                        <div>
                          <span className="block text-[11px] font-bold text-slate-600 mb-1.5">
                            Select Active Weekdays:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {WEEKDAY_LABELS.map((day) => {
                              const selected = formData.recurrenceDaysOfWeek.includes(day.value);
                              return (
                                <button
                                  key={day.value}
                                  type="button"
                                  onClick={() => {
                                    const nextDays = selected
                                      ? formData.recurrenceDaysOfWeek.filter((d) => d !== day.value)
                                      : [...formData.recurrenceDaysOfWeek, day.value].sort();
                                    setFormData({ ...formData, recurrenceDaysOfWeek: nextDays });
                                  }}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
                                    selected
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-slate-600 border-slate-200'
                                  }`}
                                >
                                  {day.short}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {recurringPreview && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2 max-h-48 overflow-y-auto">
                          <div className="flex items-center justify-between text-xs font-extrabold">
                            <span>
                              Generated {recurringPreview.length} Occurrences Preview
                            </span>
                            {recurringConflictCount > 0 ? (
                              <span className="text-rose-600">
                                {recurringConflictCount} Conflict(s) Detected
                              </span>
                            ) : (
                              <span className="text-emerald-600">
                                Zero Conflicts — Ready to Save
                              </span>
                            )}
                          </div>
                          <div className="divide-y divide-slate-100 text-xs">
                            {recurringPreview.map((occ) => (
                              <div
                                key={occ.occurrenceNumber}
                                className="py-1.5 flex items-center justify-between"
                              >
                                <span className="font-semibold text-slate-800">
                                  #{occ.occurrenceNumber} •{' '}
                                  {new Date(occ.startAt).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}{' '}
                                  ({occ.startTime} – {occ.endTime})
                                </span>
                                {occ.hasConflict ? (
                                  <span className="text-rose-600 font-bold">
                                    Conflict: {occ.conflicts?.[0]?.type}
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 font-bold">Available</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? 'Verifying Conflicts & Saving...'
                    : editingSession
                    ? 'Save Changes / Reschedule'
                    : formData.isRecurring
                    ? 'Create Recurring Series'
                    : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: SESSION INSPECTOR & CHANGE HISTORY
      ===================================================================== */}
      {inspectingSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    STATUS_BADGE_MAP[inspectingSession.status]?.bg
                  } ${STATUS_BADGE_MAP[inspectingSession.status]?.text} ${
                    STATUS_BADGE_MAP[inspectingSession.status]?.border
                  }`}
                >
                  {STATUS_BADGE_MAP[inspectingSession.status]?.label}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {inspectingSession.batchCode}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectingSession(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <h3 className="text-xl font-black text-[#0F172A]">{inspectingSession.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{inspectingSession.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Date & Time</span>
                  <span className="font-extrabold text-[#0F172A]">
                    {new Date(inspectingSession.startAt).toDateString()} •{' '}
                    {inspectingSession.startTime} – {inspectingSession.endTime} (
                    {inspectingSession.durationMinutes}m)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Timezone</span>
                  <span className="font-extrabold text-[#0F172A]">{inspectingSession.timezone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Instructor</span>
                  <span className="font-extrabold text-[#0F172A]">
                    {inspectingSession.instructorName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Class Type & Visibility</span>
                  <span className="font-extrabold text-[#0F172A] uppercase">
                    {inspectingSession.classType} • {inspectingSession.visibility}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-bold block">
                    Protected Meeting Link ({inspectingSession.meetingProvider})
                  </span>
                  <a
                    href={inspectingSession.liveSessionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline break-all"
                  >
                    {inspectingSession.liveSessionUrl}
                  </a>
                </div>
              </div>

              {inspectingSession.cancellationReason && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold">
                  <strong>Cancellation Reason:</strong> {inspectingSession.cancellationReason}
                </div>
              )}

              {/* Change History Log */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
                  <History className="w-3.5 h-3.5" />
                  Administrative Change History
                </h4>
                <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {(inspectingSession.changeHistory || []).length === 0 ? (
                    <div className="p-3 text-xs text-slate-400">
                      Initial schedule record — no subsequent changes recorded.
                    </div>
                  ) : (
                    (inspectingSession.changeHistory || []).map((h, i) => (
                      <div key={i} className="p-3 text-xs space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold uppercase text-blue-700">{h.action}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(h.updatedAt).toLocaleString()} by {h.updatedBy}
                          </span>
                        </div>
                        <p className="text-slate-700">{h.summary}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleDownloadIcs(inspectingSession)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download .ICS
              </button>

              <div className="flex items-center gap-2">
                {inspectingSession.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => {
                      setCancellingSession(inspectingSession);
                      setCancelReason('');
                      setCancelScope('single');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancel Class
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEditModal(inspectingSession)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit / Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: CANCEL CLASS CONFIRMATION
      ===================================================================== */}
      {cancellingSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmCancel}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center gap-2.5 text-rose-600">
              <Ban className="w-6 h-6" />
              <h3 className="text-lg font-black text-[#0F172A]">Cancel Scheduled Class</h3>
            </div>
            <p className="text-xs text-slate-600">
              Cancelling retains the session in calendar history with a <strong>Cancelled</strong> status and notifies enrolled students in <strong>{cancellingSession.batchCode}</strong>.
            </p>

            {cancellingSession.recurrenceSeriesId && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-semibold">
                <span className="font-extrabold text-slate-700 block">
                  Recurring Cancellation Scope:
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cancelScope"
                    checked={cancelScope === 'single'}
                    onChange={() => setCancelScope('single')}
                  />
                  Cancel this occurrence only
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cancelScope"
                    checked={cancelScope === 'series'}
                    onChange={() => setCancelScope('series')}
                  />
                  Cancel entire recurring series
                </label>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cancellation Reason *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g., Instructor travel schedule adjustment — rescheduled to Sunday evening"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingSession(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Keep Class
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default AdminCalendar;
