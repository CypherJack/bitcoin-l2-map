// Hover, select, focus + edge highlighting.

import { CATEGORIES, EDGES, NODES, state } from './data';
import { app, edgesSvg, nodesLayer, panel } from './dom';
import { showPanelDetail } from './panel';

export function hoverNode(id: string | null): void {
  if (state.active) return;
  setFocus(id);
  showPanelDetail(id);
}

export function selectNode(id: string): void {
  state.active = state.active === id ? null : id;
  setFocus(state.active ?? id);
  showPanelDetail(state.active);
  panel.classList.toggle('panel-open', !!state.active);
}

export function setFocus(id: string | null): void {
  app.classList.toggle('has-active', !!id);
  nodesLayer.querySelectorAll('.node').forEach((el) => el.classList.remove('active', 'related'));
  if (!id) { syncHighlight(null); return; }

  const activeEl = nodesLayer.querySelector(`[data-id="${id}"]`);
  if (activeEl) activeEl.classList.add('active');

  const related = new Set<string>();
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

export function syncHighlight(focusId: string | null): void {
  edgesSvg.querySelectorAll('.edge').forEach((el) => el.classList.remove('highlighted'));
  edgesSvg.querySelectorAll('.edge-label').forEach((el) => el.classList.remove('highlighted'));
  if (!focusId) return;

  edgesSvg.querySelectorAll<SVGElement>('.edge').forEach((el) => {
    const from = el.dataset.from;
    const to = el.dataset.to;
    if (from === focusId || to === focusId) {
      el.classList.add('highlighted');
      const otherId = from === focusId ? to : from;
      const other = NODES.find((n) => n.id === otherId);
      const self  = NODES.find((n) => n.id === focusId);
      if (!other || !self) return;
      let color = focusId === 'btc'
        ? (other.category ? `var(${CATEGORIES[other.category].css})` : 'var(--btc)')
        : (self.category  ? `var(${CATEGORIES[self.category].css})`  : 'var(--btc)');
      if (focusId === 'ln' || otherId === 'ln') color = 'var(--cat-lightning)';
      el.style.setProperty('--cat', color);
    }
  });
  edgesSvg.querySelectorAll<SVGElement>('.edge-label').forEach((el) => {
    if (el.dataset.from === focusId || el.dataset.to === focusId) {
      el.classList.add('highlighted');
    }
  });
}

export function attachInteractions(): void {
  // Wire hover/click on the statically-rendered nodes.
  nodesLayer.querySelectorAll<HTMLElement>('.node').forEach((el) => {
    const id = el.dataset.id;
    if (!id) return;
    el.addEventListener('mouseenter', () => hoverNode(id));
    el.addEventListener('mouseleave', () => hoverNode(null));
    el.addEventListener('click', () => selectNode(id));
  });

  // Panel close.
  document.getElementById('panel-close')!.addEventListener('click', () => {
    state.active = null;
    setFocus(null);
    showPanelDetail(null);
    panel.classList.remove('panel-open');
  });
}
