/**
 * A minimal publish/subscribe emitter.
 *
 * Events used across the app (payload in parentheses):
 *   note:on (midi, velocity, source) the player pressed a key; source: 'screen' | 'computer' | 'midi'
 *   note:off (midi)                  the player released a key
 *   note:lit (midi, on)              a key should look pressed (also fired for played-back notes)
 *   pad:hit (index, velocity)        a pad was pressed
 *   control:change (group, index, value)  a knob, fader or wheel moved (value 0..1, pitch -1..1)
 *   midi:status ()                   MIDI availability or device list changed
 *   midi:message (data, command, channel)  a raw MIDI message arrived
 *   computer-keyboard:octave ()      the computer keyboard moved one octave
 *   sustain (on), bend (semitones), modulation (amount)
 *   audio:unavailable ()             the browser has no Web Audio
 *   progress:change ()               lesson progress or energy changed
 *   settings:change ()               notation or another setting changed
 */
export function createEmitter() {
  const handlers = new Map();

  return {
    /** Subscribe; returns a function that unsubscribes. */
    on(event, handler) {
      if (!handlers.has(event)) handlers.set(event, new Set());
      handlers.get(event).add(handler);
      return () => handlers.get(event).delete(handler);
    },
    emit(event, payload) {
      for (const handler of [...(handlers.get(event) || [])]) {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in "${event}" handler`, error);
        }
      }
    },
  };
}

/** The application-wide event bus. */
export const events = createEmitter();
