// Google Analytics 4 (GA4) Event Logging Utility

export const GA_MEASUREMENT_ID = 'G-R271L0YR0N';

/**
 * Log a custom event to Google Analytics 4
 * @param {string} eventName - Name of the event (e.g. 'level_up', 'quest_completed', 'session_start')
 * @param {object} params - Key-value metadata parameters
 */
export function trackEvent(eventName, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...params,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    // Non-blocking telemetry error suppression
    console.debug('[GA4] Event tracking failed silently:', err);
  }
}

/**
 * Track custom page / tab change
 * @param {string} pageTitle
 * @param {string} pagePath
 */
export function trackPageView(pageTitle, pagePath) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath || window.location.pathname
      });
    }
  } catch (err) {
    console.debug('[GA4] Pageview tracking failed silently:', err);
  }
}
