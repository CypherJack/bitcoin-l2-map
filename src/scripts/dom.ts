// DOM references resolved once at module load.
// This file is browser-only — never imported by Astro components.

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing #${id} in DOM`);
  return node as T;
}

export const app        = el('app');
export const stage      = el('stage');
export const nodesLayer = el('nodes');
export const edgesSvg   = document.getElementById('edges') as unknown as SVGSVGElement;
export const panel      = el('panel');
export const panelInner = el('panel-inner');
