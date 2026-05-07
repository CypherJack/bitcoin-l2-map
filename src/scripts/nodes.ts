// Node positioning + responsive slab updates.
// Static node DOM is rendered by Astro (see Stage.astro / Node.astro);
// this module only computes pixel positions on layout.

import { NODES, TIERS, TIER_Y, state } from './data';
import { nodesLayer, stage } from './dom';
import { drawEdges } from './edges';
import { renderBtcSlab, renderLnMesh } from './slabs';

function stackPositions(stageWidth: number): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {};
  const isMobile = stageWidth < 769;

  const minXNorm = isMobile ? 0.15 : (16 + 200 + 28 + 12) / stageWidth;
  const maxXNorm = isMobile ? 0.85 : 0.84;
  const colX = (i: number, n: number) => minXNorm + (i / (n - 1)) * (maxXNorm - minXNorm);

  const ty = isMobile ? TIER_Y.mobile : TIER_Y.desktop;
  pos.btc = { x: 0.50, y: ty.node[3] };
  pos.ln  = { x: 0.50, y: ty.node[2] };

  const tier15Order = ['ark', 'spark', 'rgb', 'bitvm', 'ordinals'];
  const tier15 = tier15Order.filter((id) => NODES.find((n) => n.id === id));
  tier15.forEach((id, i) => {
    pos[id] = { x: colX(i, tier15.length), y: ty.node[1] };
  });

  const tier2 = NODES.filter((n) => n.tier === 2).map((n) => n.id);
  tier2.forEach((id, i) => {
    pos[id] = { x: colX(i, tier2.length), y: ty.node[0] };
  });

  return pos;
}

function applyPositions(): void {
  NODES.forEach((n) => {
    const el = nodesLayer.querySelector<HTMLElement>(`[data-id="${n.id}"]`);
    if (!el) return;
    const p = state.px[n.id];
    el.style.left = p.x + 'px';
    el.style.top  = p.y + 'px';
  });
}

function updateWideSlabs(stageWidth: number): void {
  const slabWidth = Math.max(200, Math.round(stageWidth * 0.8));
  const ln  = nodesLayer.querySelector<HTMLElement>('[data-id="ln"] .node-core');
  const btc = nodesLayer.querySelector<HTMLElement>('[data-id="btc"] .node-core');
  if (ln)  ln.innerHTML  = renderLnMesh(slabWidth);
  if (btc) btc.innerHTML = renderBtcSlab(slabWidth);
}

export function layoutAll(): void {
  const { width, height } = stage.getBoundingClientRect();
  stage.style.setProperty('--stage-w', width + 'px');
  const isMobile = width < 769;

  // Strata positions are driven by JS so mobile/desktop bands match the node grid.
  TIERS.forEach((t) => {
    const el = document.querySelector<HTMLElement>(`.stratum.${t.id}`);
    if (el) el.style.setProperty('--t', String(TIER_Y[isMobile ? 'mobile' : 'desktop'].label(t.row)));
  });

  const norm = stackPositions(width);
  NODES.forEach((n) => {
    const p = norm[n.id];
    state.px[n.id] = { x: p.x * width, y: p.y * height };
  });
  applyPositions();
  updateWideSlabs(width);
  drawEdges();
}
