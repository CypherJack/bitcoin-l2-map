// Boot-time data wiring. Browser-only.
// `window.__APP_DATA__` is injected by the Astro page (see [lang]/index.astro).
// Here we merge it with the static topology to expose typed runtime values.

import {
  CATEGORY_CSS,
  EDGES,
  NODE_META,
  TIERS,
  TIER_Y,
} from '../content/topology';
import type {
  AppNode,
  Category,
  CategoryKey,
  NodeContent,
  State,
  Strings,
} from '../types';

const APP = window.__APP_DATA__;

export const S: Strings = APP.t;

export const CATEGORIES: Record<CategoryKey, Category> = Object.fromEntries(
  (Object.keys(CATEGORY_CSS) as CategoryKey[]).map((key) => [
    key,
    { label: S.categories[key] ?? key, css: CATEGORY_CSS[key] },
  ])
) as Record<CategoryKey, Category>;

const contentById: Record<string, NodeContent> = Object.fromEntries(
  APP.nodesContent.map((n) => [n.id, n])
);

export const NODES: AppNode[] = NODE_META.map(
  (meta) => ({ ...meta, ...contentById[meta.id] }) as AppNode
);

export { EDGES, TIERS, TIER_Y };

export const state: State = {
  edge: 'straight',
  active: null,
  px: {},
};
