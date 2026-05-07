// SVG edge drawing — paths between nodes, plus shelf-placed edge labels.

import { CATEGORIES, EDGES, NODES, TIER_Y, state } from './data';
import { edgesSvg, stage } from './dom';
import { syncHighlight } from './interaction';
import type { Edge } from '../types';

interface Item {
  e: Edge;
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  edgeColor: string;
  g?: SVGGElement;
  halfW?: number;
  halfH?: number;
  zone?: 'btc_up' | 'ln_up' | null;
  labelX?: number;
  labelY?: number;
  _sortX?: number;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

export function drawEdges(): void {
  const { width, height } = stage.getBoundingClientRect();
  edgesSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  edgesSvg.innerHTML = '';

  const btcPx = state.px['btc'], lnPx = state.px['ln'];
  if (!btcPx || !lnPx) { syncHighlight(null); return; }

  const isMobile = width < 769;
  const slabHalfW = isMobile ? width * 0.9 : width * 0.4;
  const slabHalfH = isMobile ? 22 : 28;
  const Y_NP = 0.37 * height;
  const nodeR = 42;
  const lnTierLabelY = TIER_Y[isMobile ? 'mobile' : 'desktop'].label(2) * height;
  const ZONE = {
    btc_up: {
      yMin: lnPx.y + slabHalfH + 6,
      yMax: btcPx.y - slabHalfH - 6,
    },
    ln_up: {
      yMin: Y_NP + nodeR + 6,
      yMax: Math.min(lnPx.y - slabHalfH - 6, lnTierLabelY - 16),
    },
  } as const;

  const MAX_TILT_BTC = 20 * Math.PI / 180;
  const MAX_TILT_LN  = 10 * Math.PI / 180;

  function attach(id: string, otherId: string): { x: number; y: number } {
    const p = state.px[id];
    const other = state.px[otherId];
    if (id === 'btc' || id === 'ln') {
      const slabY = (other.y < p.y) ? p.y - slabHalfH : p.y + slabHalfH;
      const otherIsSlab = otherId === 'btc' || otherId === 'ln';
      if (otherIsSlab) {
        return { x: p.x, y: slabY };
      }
      const dxNorm = Math.max(-1, Math.min(1, (other.x - p.x) / slabHalfW));
      const maxTilt = id === 'btc' ? MAX_TILT_BTC : MAX_TILT_LN;
      const angle = -dxNorm * maxTilt;
      const dy = slabY - other.y;
      return { x: other.x + Math.tan(angle) * dy, y: slabY };
    }
    return { x: p.x, y: p.y };
  }

  const items: Item[] = [];
  EDGES.forEach((e) => {
    const A = state.px[e.from], B = state.px[e.to];
    if (!A || !B) return;
    const p1 = attach(e.from, e.to);
    const p2 = attach(e.to, e.from);
    const fromNode = NODES.find((n) => n.id === e.from);
    const toNode   = NODES.find((n) => n.id === e.to);
    if (!fromNode || !toNode) return;
    const catKey = fromNode.category ?? toNode.category;
    let edgeColor = catKey ? `var(${CATEGORIES[catKey].css})` : 'var(--btc)';
    if (e.from === 'ln' || e.to === 'ln') edgeColor = 'var(--cat-lightning)';
    items.push({ e, p1, p2, edgeColor });
  });

  items.forEach((it) => {
    const { e, p1, p2 } = it;
    let d: string;
    if (state.edge === 'curved') {
      const cxm = (p1.x + p2.x) / 2, cym = (p1.y + p2.y) / 2;
      const cx = width / 2, cy = height / 2;
      const nx = cym - cy, ny = -(cxm - cx);
      const nlen = Math.hypot(nx, ny) || 1;
      const offset = 36;
      const bx = cxm + (nx / nlen) * offset;
      const by = cym + (ny / nlen) * offset;
      d = `M ${p1.x} ${p1.y} Q ${bx} ${by} ${p2.x} ${p2.y}`;
    } else {
      d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
    }
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'edge ' + (e.style || 'solid'));
    path.dataset.from = e.from;
    path.dataset.to   = e.to;
    if (e.secondary) path.setAttribute('opacity', '0.7');
    edgesSvg.appendChild(path);
  });

  const zoneFor = (e: Edge): 'btc_up' | 'ln_up' | null =>
    e.from === 'btc' ? 'btc_up'
    : e.from === 'ln' ? 'ln_up'
    : null;

  items.forEach((it) => {
    const { e, edgeColor, p1, p2 } = it;
    const tg = document.createElementNS(SVG_NS, 'g');
    tg.setAttribute('class', 'edge-label' + (e.secondary ? ' secondary' : ''));
    tg.dataset.from = e.from;
    tg.dataset.to   = e.to;
    tg.style.setProperty('--cat', edgeColor);
    const txt = document.createElementNS(SVG_NS, 'text');
    txt.textContent = e.kind;
    txt.setAttribute('x', '0'); txt.setAttribute('y', '0');
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('dy', '0.35em');
    tg.appendChild(txt);
    edgesSvg.appendChild(tg);
    const bbox = txt.getBBox();
    const padX = 6, padY = 4;
    const bg = document.createElementNS(SVG_NS, 'rect');
    bg.setAttribute('x', String(bbox.x - padX));
    bg.setAttribute('y', String(bbox.y - padY));
    bg.setAttribute('width',  String(bbox.width  + padX * 2));
    bg.setAttribute('height', String(bbox.height + padY * 2));
    bg.setAttribute('fill', 'var(--bg)');
    bg.style.stroke = edgeColor;
    bg.setAttribute('stroke-width', '1');
    tg.insertBefore(bg, txt);
    it.g = tg;
    it.halfW = bbox.width / 2 + padX;
    it.halfH = bbox.height / 2 + padY;
    it.zone = zoneFor(e);
    it.labelX = (p1.x + p2.x) / 2;
    it.labelY = (p1.y + p2.y) / 2;
  });

  // Shelf-based placement inside each zone.
  (Object.entries(ZONE) as Array<['btc_up' | 'ln_up', typeof ZONE[keyof typeof ZONE]]>).forEach(
    ([zkey, Z]) => {
      const zItems = items.filter((it) => it.zone === zkey);
      if (!zItems.length) return;

      const shelfStep = 26;
      const zoneH = Z.yMax - Z.yMin;
      const shelfCount = Math.max(1, Math.floor(zoneH / shelfStep));
      const shelfYs: number[] = [];
      for (let i = 0; i < shelfCount; i++) {
        shelfYs.push(Z.yMin + (zoneH - (shelfCount - 1) * shelfStep) / 2 + i * shelfStep);
      }

      const zC = (Z.yMin + Z.yMax) / 2;
      zItems.forEach((it) => {
        const dy = it.p2.y - it.p1.y;
        const t = dy ? (zC - it.p1.y) / dy : 0.5;
        const tC = Math.max(0.08, Math.min(0.92, t));
        it._sortX = it.p1.x + tC * (it.p2.x - it.p1.x);
      });
      zItems.sort((a, b) => (a._sortX ?? 0) - (b._sortX ?? 0));

      const shelfOccupants: Array<Array<{ l: number; r: number }>> = shelfYs.map(() => []);
      zItems.forEach((it) => {
        let placed = false;
        for (let s = 0; s < shelfCount; s++) {
          const sy = shelfYs[s];
          const dy = it.p2.y - it.p1.y;
          const t = dy ? (sy - it.p1.y) / dy : 0.5;
          const tC = Math.max(0.05, Math.min(0.95, t));
          const lx = it.p1.x + tC * (it.p2.x - it.p1.x);
          const halfW = it.halfW ?? 0;
          const leftX = lx - halfW, rightX = lx + halfW;
          const conflicts = shelfOccupants[s].some(
            (o) => !(rightX + 4 < o.l || leftX > o.r + 4)
          );
          if (!conflicts) {
            shelfOccupants[s].push({ l: leftX, r: rightX });
            it.labelX = lx;
            it.labelY = sy;
            placed = true;
            break;
          }
        }
        if (!placed) {
          const sy = shelfYs[shelfCount - 1];
          const dy = it.p2.y - it.p1.y;
          const t = dy ? (sy - it.p1.y) / dy : 0.5;
          const tC = Math.max(0.05, Math.min(0.95, t));
          it.labelX = it.p1.x + tC * (it.p2.x - it.p1.x);
          it.labelY = sy;
        }
      });
    }
  );

  items.forEach((it) => {
    if (it.g) it.g.setAttribute('transform', `translate(${it.labelX},${it.labelY})`);
  });

  syncHighlight(null);
}
