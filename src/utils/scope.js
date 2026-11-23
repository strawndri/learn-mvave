import { events } from './events.js';

/**
 * A scope collects everything a page or a widget sets up (event listeners,
 * timers, cleanup callbacks) so it can all be undone with one `dispose()`.
 */
export function createScope() {
  const cleanups = [];

  const scope = {
    /** Register a function to run on dispose. */
    add(cleanup) {
      cleanups.push(cleanup);
      return cleanup;
    },
    /** Subscribe to an app event until the scope is disposed. */
    on(event, handler) {
      return scope.add(events.on(event, handler));
    },
    /** Add a DOM listener until the scope is disposed. */
    listen(target, type, handler, options) {
      target.addEventListener(type, handler, options);
      return scope.add(() => target.removeEventListener(type, handler, options));
    },
    timeout(callback, delay) {
      const id = setTimeout(callback, delay);
      scope.add(() => clearTimeout(id));
      return id;
    },
    interval(callback, delay) {
      const id = setInterval(callback, delay);
      scope.add(() => clearInterval(id));
      return id;
    },
    dispose() {
      while (cleanups.length) {
        try {
          cleanups.pop()();
        } catch (error) {
          console.error('Error while disposing scope', error);
        }
      }
    },
  };
  return scope;
}
