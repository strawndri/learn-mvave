/**
 * Make a control draggable with the pointer (vertical drag changes a value).
 *
 * options:
 *   range              [min, max] of the value
 *   pixelsForFullRange how many pixels of drag cover the whole range
 *   value()            current value (read at the start of each drag)
 *   onChange(value)    called while dragging
 *   onRelease()        optional, called when the pointer is released
 */
export function attachDrag(element, scope, { range, pixelsForFullRange, value, onChange, onRelease }) {
  let start = null;

  scope.listen(element, 'pointerdown', (event) => {
    event.preventDefault();
    element.setPointerCapture?.(event.pointerId);
    start = { y: event.clientY, value: value() };
    element.classList.add('is-dragging');
  });

  scope.listen(element, 'pointermove', (event) => {
    if (!start) return;
    const [min, max] = range;
    const change = ((start.y - event.clientY) / pixelsForFullRange) * (max - min);
    onChange(Math.min(max, Math.max(min, start.value + change)));
  });

  const finish = () => {
    if (!start) return;
    start = null;
    element.classList.remove('is-dragging');
    onRelease?.();
  };
  scope.listen(element, 'pointerup', finish);
  scope.listen(element, 'pointercancel', finish);
}
