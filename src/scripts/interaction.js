// Hover, select, focus + edge highlighting.

import { NODES, EDGES, CATEGORIES, state, app, nodesLayer, edgesSvg } from './data.js';
import { renderPanel, renderEmptyPanel } from './panel.js';

export function hoverNode(id) {
  if (state.active) return;
  setFocus(id);
  if (id) renderPanel(id);
  else renderEmptyPanel();
}

export function selectNode(id) {
  state.active = state.active === id ? null : id;
  setFocus(state.active || id);
  const panel = document.getElementById('panel');
  if (state.active) {
    renderPanel(state.active);
    panel.classList.add('panel-open');
  } else {
    renderEmptyPanel();
    panel.classList.remove('panel-open');
  }
}

export function setFocus(id) {
  app.classList.toggle('has-active', !!id);
  nodesLayer.querySelectorAll('.node').forEach((el) => el.classList.remove('active', 'related'));
  if (!id) { syncHighlight(); return; }

  const activeEl = nodesLayer.querySelector(`[data-id="${id}"]`);
  if (activeEl) activeEl.classList.add('active');

  const related = new Set();
  EDGES.forEach((e) => {
    if (e.from === id) related.add(e.to);
    if (e.to   === id) related.add(e.from);
  });
  related.forEach((rid) => {
    const el = nodesLayer.querySelector(`[data-id="${rid}"]`);
    if (el) el.classList.add('related');
  });

  syncHighlight(id);
}

export function syncHighlight(focusId) {
  edgesSvg.querySelectorAll('.edge').forEach((el) => el.classList.remove('highlighted'));
  edgesSvg.querySelectorAll('.edge-label').forEach((el) => el.classList.remove('highlighted'));
  if (!focusId) return;

  edgesSvg.querySelectorAll('.edge').forEach((el) => {
    if (el.dataset.from === focusId || el.dataset.to === focusId) {
      el.classList.add('highlighted');
      const otherId = el.dataset.from === focusId ? el.dataset.to : el.dataset.from;
      const other = NODES.find((n) => n.id === otherId);
      const self  = NODES.find((n) => n.id === focusId);
      let color = focusId === 'btc'
        ? (other.category ? `var(${CATEGORIES[other.category].css})` : 'var(--btc)')
        : (self.category  ? `var(${CATEGORIES[self.category].css})`  : 'var(--btc)');
      if (focusId === 'ln' || otherId === 'ln') color = 'var(--cat-lightning)';
      el.style.setProperty('--cat', color);
    }
  });
  edgesSvg.querySelectorAll('.edge-label').forEach((el) => {
    if (el.dataset.from === focusId || el.dataset.to === focusId) {
      el.classList.add('highlighted');
    }
  });
}

export function attachPanelClose() {
  document.getElementById('panel-close').addEventListener('click', () => {
    state.active = null;
    setFocus(null);
    renderEmptyPanel();
    document.getElementById('panel').classList.remove('panel-open');
  });
}
