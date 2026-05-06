// Boot-time data wiring.
// `window.__APP_DATA__` is injected by the Astro page (define:vars).
// Here we merge it with the static topology to expose the same shape
// the rest of the app expects (S, CATEGORIES, NODES, EDGES, TIERS, TIER_Y).

import {
  NODE_META,
  CATEGORY_CSS,
  EDGES,
  TIERS,
  TIER_Y,
} from '../content/topology.js';

const APP = window.__APP_DATA__ || {};

export const S = APP.t || {};

export const CATEGORIES = Object.fromEntries(
  Object.entries(CATEGORY_CSS).map(([key, css]) => [
    key,
    { label: (S.categories || {})[key] || key, css },
  ])
);

// Merge static node metadata with per-locale translated content.
const contentById = Object.fromEntries((APP.nodesContent || []).map((n) => [n.id, n]));
export const NODES = NODE_META.map((meta) => ({
  ...meta,
  ...(contentById[meta.id] || {}),
}));

export { EDGES, TIERS, TIER_Y };

export const state = {
  edge: 'straight',
  labels: true,
  rings: true,
  bgtype: true,
  active: null,
  px: {},
};

// DOM references. Components are static-rendered by Astro, so they exist
// the moment this module evaluates (script is at end of body).
export const app        = document.getElementById('app');
export const stage      = document.getElementById('stage');
export const nodesLayer = document.getElementById('nodes');
export const edgesSvg   = document.getElementById('edges');
export const panelInner = document.getElementById('panel-inner');
