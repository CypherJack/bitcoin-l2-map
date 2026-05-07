// Shared topology — identical across locales.
// Per-node translatable text lives in src/content/nodes.<lang>.json.

import type { CategoryKey, Edge, NodeMeta, Tier } from '../types';

export const NODE_META: NodeMeta[] = [
  { id: 'btc',      tier: 1,    category: null,         symbol: '₿'     },
  { id: 'ln',       tier: 'ln', category: 'channel',    symbol: '⚡'    },
  { id: 'liquid',   tier: 2,    category: 'sidechain',  symbol: 'L-BTC' },
  { id: 'rsk',      tier: 2,    category: 'sidechain',  symbol: 'RBTC'  },
  { id: 'ark',      tier: 15,   category: 'channel',    symbol: 'A'     },
  { id: 'citrea',   tier: 2,    category: 'rollup',     symbol: 'ZK'    },
  { id: 'bitvm',    tier: 15,   category: 'rollup',     symbol: '∿'    },
  { id: 'spark',    tier: 15,   category: 'channel',    symbol: '✦'    },
  { id: 'rgb',      tier: 15,   category: 'client',     symbol: '▦'    },
  { id: 'fedi',     tier: 2,    category: 'ecash',      symbol: 'E'     },
  { id: 'ordinals', tier: 15,   category: 'inscription', symbol: '◉'   },
];

export const CATEGORY_CSS: Record<CategoryKey, string> = {
  channel:     '--cat-channel',
  sidechain:   '--cat-sidechain',
  rollup:      '--cat-rollup',
  client:      '--cat-client',
  ecash:       '--cat-ecash',
  inscription: '--cat-inscription',
};

export const EDGES: Edge[] = [
  // L1 → L1.5
  { from: 'btc', to: 'ln',       kind: 'HTLC channel peg',      style: 'solid' },
  { from: 'btc', to: 'ark',      kind: 'Shared UTXO round',     style: 'solid' },
  { from: 'btc', to: 'spark',    kind: 'Lightning funding tx',  style: 'solid' },
  { from: 'btc', to: 'rgb',      kind: 'Single-use seal',       style: 'solid' },
  { from: 'btc', to: 'bitvm',    kind: 'Script primitive',      style: 'cryptographic' },
  // L1 → L2
  { from: 'btc', to: 'liquid',   kind: 'Federated peg (11/15)', style: 'dashed' },
  { from: 'btc', to: 'rsk',      kind: 'PowPeg · merge-mined',  style: 'dashed' },
  { from: 'btc', to: 'citrea',   kind: 'BitVM bridge',          style: 'cryptographic' },
  { from: 'btc', to: 'fedi',     kind: 'Federated multisig',    style: 'dashed' },
  { from: 'btc', to: 'ordinals', kind: 'Embedded witness data', style: 'solid' },
  // LN gateway connections
  { from: 'ln', to: 'ark',    kind: 'LN gateway',         style: 'dotted', secondary: true },
  { from: 'ln', to: 'spark',  kind: 'LN gateway',         style: 'dotted', secondary: true },
  { from: 'ln', to: 'rgb',    kind: 'Carries RGB assets', style: 'dotted', secondary: true },
  { from: 'ln', to: 'liquid', kind: 'LN gateway',         style: 'dotted', secondary: true },
  { from: 'ln', to: 'rsk',    kind: 'LN gateway',         style: 'dotted', secondary: true },
  { from: 'ln', to: 'citrea', kind: 'LN gateway',         style: 'dotted', secondary: true },
  { from: 'ln', to: 'fedi',   kind: 'LN in/out gateway',  style: 'dotted', secondary: true },
  // L1.5 cross
  { from: 'bitvm', to: 'citrea', kind: 'Verifies rollup state', style: 'cryptographic', secondary: true },
];

export const TIERS: Tier[] = [
  { id: 'tier-2',  key: 2,    row: 0, css: null,                          labelStyle: 'white-space:normal;line-height:1.4' },
  { id: 'tier-15', key: 15,   row: 1, css: null,                          labelStyle: null },
  { id: 'tier-ln', key: 'ln', row: 2, css: '--cat: var(--cat-lightning)', labelStyle: null },
  { id: 'tier-1',  key: 1,    row: 3, css: '--cat: var(--btc)',           labelStyle: null, bedrock: true },
];

export const TIER_Y = {
  desktop: { label: (r: number) => r * 0.25 + 0.02, node: [0.12, 0.37, 0.62, 0.87] as const },
  // Mobile: weighted bands 20/20/30/30, each split 25% label / 50% node / 25% connections
  mobile:  { label: (r: number) => [0.02, 0.20, 0.44, 0.80][r], node: [0.10, 0.28, 0.52, 0.88] as const },
};
