declare global {
  interface Window {
    dataLayer?: any[];
  }
}

/**
 * Push an event and payload to Google Tag Manager dataLayer.
 */
export function pushGtmEvent(event: string, payload?: Record<string, any>): void {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
}

