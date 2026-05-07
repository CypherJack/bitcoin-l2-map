// Tweaks panel.
// Labels / category-rings / background-typography toggles are CSS-only
// (driven by `:checked` + `:has()` in tweaks.css). Edge style stays JS
// because curved/straight require redrawing SVG paths.

import { state } from './data';
import { drawEdges } from './edges';
import type { EdgeMode } from '../types';

function setEdge(v: EdgeMode): void {
  state.edge = v;
  drawEdges();
  document.querySelectorAll<HTMLButtonElement>('[data-group="edge"] button').forEach((b) => {
    b.classList.toggle('active', b.dataset.v === v);
  });
}

export function attachTweaks(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-group="edge"] button').forEach((b) => {
    b.addEventListener('click', () => setEdge(b.dataset.v as EdgeMode));
  });
}
