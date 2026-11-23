import { events } from '../utils/events.js';

/**
 * A tiny hash router. Routes look like `#/lesson/notes/2`: the first part names the
 * page and the rest are its parameters.
 */

/** ['lesson', 'notes', '2'] for '#/lesson/notes/2'. */
export function parseHash(hash = window.location.hash) {
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
}

export function navigate(path) {
  window.location.hash = `#/${path}`;
}

/** Change the address (for example the current step) without rendering the page again. */
export function replaceRoute(path) {
  window.history.replaceState(null, '', `#/${path}`);
}

/**
 * @param {{ routes: Record<string, (container: HTMLElement, params: string[]) => (() => void) | void>,
 *           fallback: string, container: HTMLElement }} options
 * A route function renders into `container` and may return a function that cleans up when the page is left.
 */
export function startRouter({ routes, fallback, container }) {
  let leavePage = null;

  function render() {
    const [name = fallback, ...params] = parseHash();
    const routeName = routes[name] ? name : fallback;
    leavePage?.();
    container.replaceChildren();
    leavePage = routes[routeName](container, routeName === name ? params : []) || null;
    window.scrollTo(0, 0);
    events.emit('route:change', { name: routeName, params });
  }

  window.addEventListener('hashchange', render);
  render();
}
