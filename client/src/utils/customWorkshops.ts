import type { ApiWorkshop } from '../services/api';
import type { BatchOption } from '../types/workshop';
import { normalizeMeetingUrl } from './url';

const WORKSHOPS_KEY = 'ailp_custom_workshops_v2';
const SESSIONS_KEY = 'ailp_custom_sessions_v2';

export interface StoredSession {
  _id?: string;
  batchCode: string;
  dayNumber: number;
  title: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  instructorName?: string;
  liveSessionUrl?: string;
  meetingPasscode?: string;
  capacity?: number;
}

export function getStoredSessions(): StoredSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getStoredWorkshops(): ApiWorkshop[] {
  try {
    const raw = localStorage.getItem(WORKSHOPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatDateRange(startDateStr: string, endDateStr?: string): string {
  try {
    const s = new Date(startDateStr);
    const e = endDateStr ? new Date(endDateStr) : new Date(s.getTime() + 24 * 60 * 60 * 1000);
    return `${s.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })} – ${e.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  } catch {
    return 'Upcoming Weekend';
  }
}

function getDaysOfWeekString(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const day = d.getDay();
    if (day === 6 || day === 0) return 'Saturday & Sunday';
    return `${d.toLocaleDateString('en-US', { weekday: 'long' })} & Next Day`;
  } catch {
    return 'Saturday & Sunday';
  }
}

/**
 * Save or update a session in local storage, and automatically sync
 * a corresponding public Workshop so it appears in the registration selector.
 */
export function saveCustomSession(session: StoredSession): void {
  try {
    const existingSessions = getStoredSessions();
    const normalizedCode = session.batchCode.trim().toUpperCase();
    const updatedSessions = existingSessions.filter(
      (s) =>
        !(s.batchCode.toUpperCase() === normalizedCode && Number(s.dayNumber) === Number(session.dayNumber))
    );
    updatedSessions.push({
      ...session,
      batchCode: normalizedCode,
      liveSessionUrl: session.liveSessionUrl ? normalizeMeetingUrl(session.liveSessionUrl) : '',
    });
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));

    // Automatically derive or update a public Workshop for this cohort
    const startDate = session.sessionDate || new Date().toISOString().slice(0, 10);
    const dayNum = Number(session.dayNumber) || 1;
    const endDate =
      dayNum === 1
        ? new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        : startDate;

    const existingWorkshops = getStoredWorkshops();
    const foundIdx = existingWorkshops.findIndex(
      (w) => w.batchCode.toUpperCase() === normalizedCode
    );

    const timingsStr = session.startTime && session.endTime
      ? `${session.startTime} – ${session.endTime}${session.timezone?.includes('IST') ? ' IST' : ''}`
      : '10:00 AM – 3:00 PM IST';

    const workshopData: ApiWorkshop = {
      _id: foundIdx >= 0 ? existingWorkshops[foundIdx]._id : `ws_custom_${normalizedCode.toLowerCase()}`,
      title: 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
      slug: `ai-launchpad-${normalizedCode.toLowerCase()}`,
      batchCode: normalizedCode,
      description:
        'Master practical Generative AI in one weekend. Build custom AI assistants, workflows, and functional prototypes with live mentorship.',
      instructor: {
        name: session.instructorName || 'Vikram Malhotra',
        role: 'Staff AI Engineer & Former ML Lead',
        bio: 'Over 12 years building production software and leading enterprise LLM integrations.',
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      },
      startDate: new Date(`${startDate}T10:00:00+05:30`).toISOString(),
      endDate: new Date(`${endDate}T15:00:00+05:30`).toISOString(),
      timings: timingsStr,
      timezone: session.timezone || 'Asia/Kolkata (IST)',
      capacity: Number(session.capacity) || 60,
      enrolledCount: 0,
      reservedCount: 0,
      availableSeats: Number(session.capacity) || 60,
      price: {
        basePrice: 1999,
        currency: 'INR',
        taxPercentage: 18,
        isFree: false,
      },
      status: 'published',
    };

    if (foundIdx >= 0) {
      existingWorkshops[foundIdx] = { ...existingWorkshops[foundIdx], ...workshopData };
    } else {
      existingWorkshops.push(workshopData);
    }
    localStorage.setItem(WORKSHOPS_KEY, JSON.stringify(existingWorkshops));
  } catch (err) {
    console.warn('[saveCustomSession LocalStorage Error]', err);
  }
}

/**
 * Save a workshop directly (e.g. from AdminWorkshops page).
 */
export function saveCustomWorkshop(workshop: Partial<ApiWorkshop> & { batchCode: string }): void {
  try {
    const existingWorkshops = getStoredWorkshops();
    const normalizedCode = workshop.batchCode.trim().toUpperCase();
    const foundIdx = existingWorkshops.findIndex(
      (w) => w.batchCode.toUpperCase() === normalizedCode
    );

    const fullWorkshop: ApiWorkshop = {
      _id: workshop._id || (foundIdx >= 0 ? existingWorkshops[foundIdx]._id : `ws_${Date.now()}`),
      title: workshop.title || 'AI Launchpad — 2-Day Hands-On AI Bootcamp',
      slug: workshop.slug || `ai-launchpad-${normalizedCode.toLowerCase()}`,
      batchCode: normalizedCode,
      description: workshop.description || 'Practical Generative AI Bootcamp',
      instructor: workshop.instructor || {
        name: 'Vikram Malhotra',
        role: 'Staff AI Engineer',
        bio: 'Enterprise AI Lead',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      },
      startDate: workshop.startDate || new Date().toISOString(),
      endDate: workshop.endDate || new Date(Date.now() + 86400000).toISOString(),
      timings: workshop.timings || '10:00 AM – 3:00 PM IST',
      timezone: workshop.timezone || 'Asia/Kolkata (IST)',
      capacity: Number(workshop.capacity) || 60,
      enrolledCount: Number(workshop.enrolledCount) || 0,
      reservedCount: Number(workshop.reservedCount) || 0,
      availableSeats: Number(workshop.availableSeats) || 60,
      price: workshop.price || {
        basePrice: 1999,
        currency: 'INR',
        taxPercentage: 18,
        isFree: false,
      },
      status: workshop.status || 'published',
    };

    if (foundIdx >= 0) {
      existingWorkshops[foundIdx] = fullWorkshop;
    } else {
      existingWorkshops.push(fullWorkshop);
    }
    localStorage.setItem(WORKSHOPS_KEY, JSON.stringify(existingWorkshops));
  } catch (err) {
    console.warn('[saveCustomWorkshop LocalStorage Error]', err);
  }
}

/**
 * Merge API workshops with any locally stored custom workshops.
 */
export function mergeWorkshopsWithStored(apiWorkshops: ApiWorkshop[] = []): ApiWorkshop[] {
  const custom = getStoredWorkshops();
  if (!custom || custom.length === 0) return apiWorkshops;

  const map = new Map<string, ApiWorkshop>();
  // 1. Put API workshops first
  for (const w of apiWorkshops) {
    if (w && w.batchCode) {
      map.set(w.batchCode.toUpperCase(), w);
    }
  }
  // 2. Merge local custom workshops (if not in map or newer)
  for (const c of custom) {
    if (c && c.batchCode) {
      const code = c.batchCode.toUpperCase();
      if (!map.has(code)) {
        map.set(code, c);
      } else {
        // Keep merged
        map.set(code, { ...map.get(code)!, ...c });
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

/**
 * Merge UI BatchOptions with any locally stored custom workshops.
 */
export function mergeBatchOptionsWithStored(baseBatches: BatchOption[] = []): BatchOption[] {
  const custom = getStoredWorkshops();
  if (!custom || custom.length === 0) return baseBatches;

  const map = new Map<string, BatchOption>();
  for (const b of baseBatches) {
    if (b && b.batchCode) {
      map.set(b.batchCode.toUpperCase(), b);
    }
  }

  for (const c of custom) {
    if (c && c.batchCode) {
      const code = c.batchCode.toUpperCase();
      if (!map.has(code)) {
        map.set(code, {
          id: c._id,
          batchCode: code,
          dateRange: formatDateRange(c.startDate, c.endDate),
          days: getDaysOfWeekString(c.startDate),
          timings: c.timings || '10:00 AM – 3:00 PM IST',
          timezone: c.timezone || 'Asia/Kolkata (IST)',
          totalSeats: c.capacity,
          availableSeats: c.availableSeats,
          status: 'Open',
          pricing: {
            basePrice: c.price?.basePrice ?? 1999,
            currency: c.price?.currency || 'INR',
            taxPercentage: c.price?.taxPercentage ?? 18,
          },
        });
      }
    }
  }

  return Array.from(map.values());
}
