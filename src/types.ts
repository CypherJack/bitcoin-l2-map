// Shared types used across components and scripts.

export type CategoryKey =
  | 'channel'
  | 'sidechain'
  | 'rollup'
  | 'client'
  | 'ecash'
  | 'inscription';

export type TierKey = 1 | 2 | 15 | 'ln';

export type EdgeStyle = 'solid' | 'dashed' | 'dotted' | 'cryptographic';

export type EdgeMode = 'straight' | 'curved';

export interface NodeMeta {
  id: string;
  tier: TierKey;
  category: CategoryKey | null;
  symbol: string;
}

export interface Edge {
  from: string;
  to: string;
  kind: string;
  style: EdgeStyle;
  secondary?: boolean;
}

export interface Tier {
  id: string;
  key: TierKey;
  row: number;
  css: string | null;
  labelStyle: string | null;
  bedrock?: boolean;
}

export interface Strings {
  lang: string;
  title: string;
  titleEm: string;
  pageTitle: string;
  closeLabel: string;
  settingsBtn: string;
  settingsTitle: string;
  edgeStyleLabel: string;
  edgeStraight: string;
  edgeCurved: string;
  showLabels: string;
  categoryRings: string;
  bgTypo: string;
  readMap: string;
  readMapBody: string;
  readMapEm: string;
  legendTitle: string;
  legendNative: string;
  legendFederated: string;
  legendLN: string;
  legendCrypto: string;
  readMore: string;
  pegMechanism: string;
  roleLabel: string;
  consensusLabel: string;
  bridgeLabel: string;
  l1Tag: string;
  tierLabels: Record<string, string>;
  categories: Record<CategoryKey, string>;
}

export interface NodeContent {
  id: string;
  name: string;
  learnMore: string;
  short: string;
  tagline: string;
  consensus: string;
  bridge: string | null;
  body: string;
  bridgePath: string[] | null;
  subtitle?: string;
}

// Merged at runtime — meta + per-locale content.
export type AppNode = NodeMeta & NodeContent;

export interface Category {
  label: string;
  css: string;
}

export interface State {
  edge: EdgeMode;
  active: string | null;
  px: Record<string, { x: number; y: number }>;
}

export interface AppData {
  t: Strings;
  nodesContent: NodeContent[];
}

declare global {
  interface Window {
    __APP_DATA__: AppData;
  }
}
