/** Tiny helpers to build DOM nodes without a framework. */

/**
 * Create an element.
 * `attrs` supports: `class`, `html` (inner HTML), `on<event>` handlers,
 * boolean attributes (`true` adds, `false`/`null` skips) and plain attributes.
 */
export function h(tag, attrs, ...children) {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (name === 'class') element.className = value;
    else if (name === 'html') element.innerHTML = value;
    else if (name.startsWith('on')) element.addEventListener(name.slice(2), value);
    else element.setAttribute(name, value === true ? '' : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    element.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return element;
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/** Create an SVG element with the given attributes and optional text. */
export function svg(tag, attrs = {}, text) {
  const element = document.createElementNS(SVG_NAMESPACE, tag);
  for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
  if (text != null) element.textContent = text;
  return element;
}

/** Remove every child of `element`. */
export function clear(element) {
  element.replaceChildren();
  return element;
}

/** Set several CSS custom properties at once. */
export function setCssVars(element, vars) {
  for (const [name, value] of Object.entries(vars)) element.style.setProperty(name, value);
}
