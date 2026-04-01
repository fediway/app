const MAX_ERRORS = 5;
const errors: Array<{ message: string; timestamp: number }> = [];

export function initErrorBuffer() {
  if (typeof window === 'undefined')
    return;

  window.__FEDIWAY_LAST_ERRORS__ = errors;

  window.addEventListener('error', (e) => {
    errors.push({ message: e.message || String(e.error), timestamp: Date.now() });
    if (errors.length > MAX_ERRORS)
      errors.shift();
  });

  window.addEventListener('unhandledrejection', (e) => {
    errors.push({ message: String(e.reason), timestamp: Date.now() });
    if (errors.length > MAX_ERRORS)
      errors.shift();
  });
}

export function getRecentErrors(): Array<{ message: string; timestamp: number }> {
  return [...errors];
}
