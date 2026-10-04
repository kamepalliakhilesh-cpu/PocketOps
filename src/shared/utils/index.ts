export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function nowISO(): string {
  return new Date().toISOString();
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Local-timezone date string (YYYY-MM-DD) — safe defaults for due dates. */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local-timezone date string for tomorrow (YYYY-MM-DD). */
export function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Parse a date-only string (YYYY-MM-DD) as a LOCAL date.
 * `new Date('YYYY-MM-DD')` parses as UTC midnight, which shifts the day
 * in negative-offset timezones and breaks isToday/dueLabel comparisons.
 */
function parseDateOnly(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function toDate(iso: string): Date | null {
  const d = parseDateOnly(iso) ?? new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatTime(iso: string): string {
  const d = toDate(iso);
  if (!d) return '—';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(iso: string): string {
  const d = toDate(iso);
  if (!d) return 'Unknown';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function relativeTime(iso: string): string {
  const d = toDate(iso);
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function sameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isToday(iso?: string): boolean {
  if (!iso) return false;
  const d = toDate(iso);
  if (!d) return false;
  return sameLocalDay(d, new Date());
}

export function isTomorrow(iso?: string): boolean {
  if (!iso) return false;
  const d = toDate(iso);
  if (!d) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return sameLocalDay(d, tomorrow);
}

export function dueLabel(iso?: string): string {
  if (!iso) return 'No deadline';
  if (isToday(iso)) return 'Today';
  if (isTomorrow(iso)) return 'Tomorrow';
  return formatDate(iso);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function workflowPercent(steps: { status: string }[]): number {
  if (steps.length === 0) return 0;
  const done = steps.filter(s => s.status === 'completed' || s.status === 'skipped').length;
  return Math.round((done / steps.length) * 100);
}

/** Normalize text for fuzzy search matching (case/separator insensitive). */
export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[_\-./\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
