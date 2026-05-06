// Render and position the map nodes.

import { NODES, CATEGORIES, state, stage, nodesLayer, TIERS, TIER_Y } from './data.js';
import { LOGOS } from './logos.js';
import { renderBtcSlab, renderLnMesh, updateWideSlabs } from './slabs.js';
import { hoverNode, selectNode } from './interaction.js';
import { drawEdges } from './edges.js';

export function renderNodes() {
  nodesLayer.innerHTML = '';
  NODES.forEach((n) => {
    const el = document.createElement('div');
    el.className = 'node' + (n.id === 'btc' ? ' btc' : '') + (n.id === 'ln' ? ' ln' : '');
    el.dataset.id = n.id;
    if (n.category) el.style.setProperty('--cat', `var(${CATEGORIES[n.category].css})`);
    if (n.id === 'ln') el.style.setProperty('--cat', 'var(--cat-lightning)');

    const core = document.createElement('div');
    core.className = 'node-core';

    if (n.id === 'btc') {
      core.innerHTML = renderBtcSlab(460);
    } else if (n.id === 'ln') {
      core.innerHTML = renderLnMesh(460);
    } else if (LOGOS[n.id]) {
      core.innerHTML = LOGOS[n.id].icon(22, 22);
    } else {
      core.textContent = n.symbol;
    }

    el.appendChild(core);

    const lbl = document.createElement('div');
    lbl.className = 'node-label';
    lbl.innerHTML = `${n.name}<span class="sub">${n.id === 'btc' ? 'Layer 1' : CATEGORIES[n.category]?.label || ''}</span>`;
    el.appendChild(lbl);

    el.addEventListener('mouseenter', () => hoverNode(n.id));
    el.addEventListener('mouseleave', () => hoverNode(null));
    el.addEventListener('click', () => selectNode(n.id));
    nodesLayer.appendChild(el);
  });
}

function stackPositions(stageWidth, stageHeight) {
  const pos = {};
  const isMobile = stageWidth && stageWidth < 769;

  const minXNorm = isMobile ? 0.15 : (stageWidth ? (16 + 200 + 28 + 12) / stageWidth : 0.28);
  const maxXNorm = isMobile ? 0.85 : 0.84;
  const colX = (i, n) => minXNorm + (i / (n - 1)) * (maxXNorm - minXNorm);

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

export function applyPositions() {
  NODES.forEach((n) => {
    const el = nodesLayer.querySelector(`[data-id="${n.id}"]`);
    if (!el) return;
    const p = state.px[n.id];
    el.style.left = p.x + 'px';
    el.style.top  = p.y + 'px';
  });
}

export function layoutAll() {
  const { width, height } = stage.getBoundingClientRect();
  stage.style.setProperty('--stage-w', width + 'px');
  const isMobile = width < 769;

  // Update strata positions from JS (single source of truth)
  TIERS.forEach((t) => {
    const el = document.querySelector(`.stratum.${t.id}`);
    if (el) el.style.setProperty('--t', TIER_Y[isMobile ? 'mobile' : 'desktop'].label(t.row));
  });

  const norm = stackPositions(width, height);
  NODES.forEach((n) => {
    const p = norm[n.id];
    state.px[n.id] = { x: p.x * width, y: p.y * height };
  });
  applyPositions();
  updateWideSlabs(width);
  drawEdges();
}
