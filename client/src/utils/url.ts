/** Normalize an external meeting/resource URL so browser links never resolve relative to the app origin. */
export function normalizeMeetingUrl(rawUrl?: string | null): string {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Validate that a meeting URL is a well-formed http/https URL with a valid host. */
export function isValidMeetingUrl(rawUrl?: string | null): boolean {
  const candidate = normalizeMeetingUrl(rawUrl);
  if (!candidate) return false;
  try {
    const parsed = new URL(candidate);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      Boolean(parsed.hostname) &&
      parsed.hostname.includes('.')
    );
  } catch {
    return false;
  }
}
