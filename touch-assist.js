/* Amplia a zona efetiva dos controles pequenos para 44 × 44 CSS px sem alterar o visual. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) {
    api.install(root.document);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SELECTOR = 'button,a[href],input[type="button"],input[type="submit"],input[type="reset"],summary,[role="button"],[role="link"],[tabindex]:not([tabindex="-1"]),label[for]';
  const installed = typeof WeakSet === 'function' ? new WeakSet() : null;

  function isInteractive(el) {
    return !!(el && typeof el.matches === 'function' && el.matches(SELECTOR));
  }
  function isBlocked(el) {
    if (!el || el.disabled || el.getAttribute?.('aria-disabled') === 'true' || el.getAttribute?.('aria-hidden') === 'true') return true;
    if (el.hidden || el.closest?.('[inert],[aria-hidden="true"]')) return true;
    return false;
  }
  function distanceToRect(x, y, r) {
    const w = Math.max(0, r.width || (r.right - r.left));
    const h = Math.max(0, r.height || (r.bottom - r.top));
    if (!w || !h) return Infinity;
    const extraX = Math.max(0, (44 - w) / 2), extraY = Math.max(0, (44 - h) / 2);
    const left = r.left - extraX, right = r.right + extraX;
    const top = r.top - extraY, bottom = r.bottom + extraY;
    if (x < left || x > right || y < top || y > bottom) return Infinity;
    return Math.hypot(x - (r.left + r.right) / 2, y - (r.top + r.bottom) / 2);
  }
  function findNearestInteractive(doc, x, y) {
    if (!doc || typeof doc.querySelectorAll !== 'function') return null;
    let best = null, bestDistance = Infinity;
    for (const el of doc.querySelectorAll(SELECTOR)) {
      if (isBlocked(el) || typeof el.getBoundingClientRect !== 'function') continue;
      const d = distanceToRect(x, y, el.getBoundingClientRect());
      if (d < bestDistance) { best = el; bestDistance = d; }
    }
    return best;
  }
  function install(doc) {
    if (!doc || typeof doc.addEventListener !== 'function' || (installed && installed.has(doc))) return false;
    if (installed) installed.add(doc);
    let down = null, suppressUntil = 0, assisted = null;
    const interactiveAncestor = target => target && typeof target.closest === 'function' ? target.closest(SELECTOR) : (isInteractive(target) ? target : null);
    doc.addEventListener('pointerdown', e => {
      if (!e.isPrimary || (e.pointerType !== 'touch' && e.pointerType !== 'pen') || interactiveAncestor(e.target)) { down = null; return; }
      if (e.target?.closest?.('input,textarea,select,[contenteditable="true"]')) { down = null; return; }
      down = { x: e.clientX, y: e.clientY, id: e.pointerId };
    }, { capture: true, passive: true });
    doc.addEventListener('pointerup', e => {
      if (!down || e.pointerId !== down.id || (e.pointerType !== 'touch' && e.pointerType !== 'pen')) { down = null; return; }
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 8 || interactiveAncestor(e.target)) return;
      const target = findNearestInteractive(doc, e.clientX, e.clientY);
      if (!target || typeof target.click !== 'function') return;
      assisted = target;
      suppressUntil = Date.now() + 700;
      target.click();
    }, { capture: true, passive: true });
    doc.addEventListener('pointercancel', () => { down = null; }, { capture: true, passive: true });
    doc.addEventListener('click', e => {
      if (Date.now() > suppressUntil || !e.isTrusted) return;
      const clicked = interactiveAncestor(e.target);
      if (clicked && clicked === assisted) { assisted = null; return; }
      e.preventDefault(); e.stopImmediatePropagation(); assisted = null;
    }, true);
    return true;
  }
  return { SELECTOR, findNearestInteractive, install };
});
