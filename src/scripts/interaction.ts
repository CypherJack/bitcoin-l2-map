// Hover, select, focus + edge highlighting.

import { CATEGORIES, EDGES, NODES, state } from './data';
import { app, edgesSvg, nodesLayer, panel, stage } from './dom';
import { showPanelDetail } from './panel';

// ── Mobile CTA (tap-to-focus, tap CTA to open panel) ────────────────────────

let ctaEl: HTMLButtonElement | null = null;

function isMobile(): boolean {
  return window.matchMedia('(max-width: 768px)').matches;
}

function getCtaEl(): HTMLButtonElement {
  if (!ctaEl) {
    const lang = document.documentElement.lang || 'en';
    const btn = document.createElement('button');
    btn.className = 'node-cta';
    btn.textContent = lang.startsWith('fr') ? 'LIRE PLUS →' : 'READ MORE →';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.add('panel-open');
      hideCta();
    });
    stage.appendChild(btn);
    ctaEl = btn;
  }
  return ctaEl;
}

function showCta(id: string): void {
  const px = state.px[id];
  if (!px) return;
  const node = NODES.find((n) => n.id === id);
  const isSlab  = id === 'btc' || id === 'ln';
  const isTier2 = node?.tier === 2;
  const catKey  = node?.category ?? null;
  let color = catKey ? `var(${CATEGORIES[catKey].css})` : 'var(--btc)';
  if (id === 'ln') color = 'var(--cat-lightning)';

  // Tier-2 nodes sit at the very top — place CTA above so it doesn't collide
  // with the next tier's label. All other nodes get it below.
  let ctaY: number;
  if (isTier2)   ctaY = Math.max(4, px.y - 60);
  else if (isSlab) ctaY = px.y + 30;
  else             ctaY = px.y + 60;

  const btn = getCtaEl();
  btn.style.setProperty('--cta-color', color);
  btn.style.left = px.x + 'px';
  btn.style.top  = ctaY + 'px';
  requestAnimationFrame(() => btn.classList.add('visible'));
}

function hideCta(): void {
  ctaEl?.classList.remove('visible');
}

// ── Core interaction state ───────────────────────────────────────────────────

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

export function attachInfoBar(): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>('.info-tab[data-ib]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.ib!;
      const target = document.getElementById(`ib-${id}`)!;
      const isOpen = !target.hidden;

      // Close all panels and reset all tabs
      document.querySelectorAll<HTMLElement>('.info-panel').forEach((p) => { p.hidden = true; });
      tabs.forEach((t) => t.setAttribute('aria-expanded', 'false'));
      document.documentElement.classList.remove('info-expanded');

      // If it was closed, open it
      if (!isOpen) {
        target.hidden = false;
        tab.setAttribute('aria-expanded', 'true');
        document.documentElement.classList.add('info-expanded');
      }

      // Stage height changed — re-layout everything
      window.dispatchEvent(new Event('layout-needed'));
    });
  });
}

export function attachInteractions(): void {
  nodesLayer.querySelectorAll<HTMLElement>('.node').forEach((el) => {
    const id = el.dataset.id;
    if (!id) return;

    // Desktop: hover highlights edges and pre-fills panel
    el.addEventListener('mouseenter', () => hoverNode(id));
    el.addEventListener('mouseleave', () => hoverNode(null));

    el.addEventListener('click', (e) => {
      if (!isMobile()) {
        // Desktop: click toggles panel open
        selectNode(id);
        return;
      }

      // Mobile: first tap focuses + shows CTA; second tap on same node opens panel
      e.stopPropagation();
      if (state.active === id) {
        panel.classList.add('panel-open');
        return;
      }
      hideCta();
      state.active = id;
      setFocus(id);
      showPanelDetail(id);
      showCta(id);
    });
  });

  // Mobile: tap on empty stage area clears focus
  stage.addEventListener('click', () => {
    if (!isMobile() || !state.active) return;
    state.active = null;
    setFocus(null);
    showPanelDetail(null);
    hideCta();
  });

  // Panel close
  document.getElementById('panel-close')!.addEventListener('click', () => {
    state.active = null;
    setFocus(null);
    showPanelDetail(null);
    panel.classList.remove('panel-open');
    hideCta();
  });
}
