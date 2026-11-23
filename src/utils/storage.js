const PREFIX = 'learn-mvave:';

/** Read a JSON value from localStorage, falling back when it is missing or storage is blocked. */
export function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** Write a JSON value to localStorage; silently ignores blocked storage (private windows, etc.). */
export function writeStored(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the app still works, it just forgets */
  }
}
