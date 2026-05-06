// Tweaks panel: edge style, label/ring/bg-typography toggles.

import { state, nodesLayer } from './data.js';
import { drawEdges } from './edges.js';

export function applyToggles() {
  nodesLayer.querySelectorAll('.node-label').forEach((l) => {
    l.style.display = state.labels ? '' : 'none';
  });
  nodesLayer.querySelectorAll('.node').forEach((n) => {
    n.classList.toggle('no-ring', !state.rings);
  });
  document.querySelectorAll('.bg-type').forEach((b) => {
    b.style.display = state.bgtype ? '' : 'none';
  });
}

function setEdge(v) {
  state.edge = v;
  drawEdges();
  document.querySelectorAll('[data-group="edge"] button').forEach((b) => {
    b.classList.toggle('active', b.dataset.v === v);
  });
}

export function attachTweaks() {
  const tkPanel = document.getElementById('tweaks');
  document.getElementById('tk-open').addEventListener('click', () => tkPanel.classList.toggle('open'));
  document.getElementById('tk-close').addEventListener('click', () => tkPanel.classList.remove('open'));

  document.querySelectorAll('[data-group="edge"] button').forEach((b) => {
    b.addEventListener('click', () => setEdge(b.dataset.v));
  });

  ['labels', 'rings', 'bgtype'].forEach((key) => {
    const input = document.getElementById('tk-' + key);
    input.checked = state[key];
    input.addEventListener('change', () => {
      state[key] = input.checked;
      applyToggles();
    });
  });
}
