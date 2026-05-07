// Pure SVG generators for the wide BTC and LN slabs.
// No DOM access — safe to import from Astro components at build time.

export function renderBtcSlab(width: number, height = 56): string {
  const bh = Math.round(height * 0.57);
  const cy = height / 2;
  const bw = 58, gap = 14, startX = 10;
  const firstBlock = 886421;
  const hashes = ['3f9a…c1d2','a7c1…b89f','d4e2…07fa','5b3c…e41a','9f1d…a35c','8e4a…2f1b','c2d7…6b4e','f8a1…9c3d','b6e3…4a2c','7d9f…1b5e','e2c4…8f3a','4a8b…d7c1'];
  const count = Math.max(1, Math.floor((width - startX * 2 + gap) / (bw + gap)));
  const totalContentW = count * bw + (count - 1) * gap;
  const offsetX = Math.round((width - totalContentW) / 2);
  let svg = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  for (let i = 0; i < count; i++) {
    const num = firstBlock + i;
    const x = offsetX + i * (bw + gap);
    if (i > 0) {
      const ax = x - 10;
      svg += `<line x1="${ax - 6}" y1="${cy}" x2="${ax}" y2="${cy}" stroke="#f7931a" stroke-opacity="0.5" stroke-width="1"/>`;
      svg += `<polygon points="${ax},${cy-3} ${ax+5},${cy} ${ax},${cy+3}" fill="#f7931a" fill-opacity="0.5"/>`;
    }
    svg += `<rect x="${x}" y="${cy - bh/2}" width="${bw}" height="${bh}" rx="1" stroke="#f7931a" stroke-opacity="0.55" fill="hsla(33,92%,54%,0.06)"/>`;
    svg += `<text x="${x + bw/2}" y="${cy - bh * 0.16}" text-anchor="middle" fill="#f7931a" fill-opacity="0.75" font-family="JetBrains Mono,monospace" font-size="7.5" letter-spacing="0.06em">#${num.toLocaleString()}</text>`;
    svg += `<text x="${x + bw/2}" y="${cy + bh * 0.24}" text-anchor="middle" fill="#f7931a" fill-opacity="0.38" font-family="JetBrains Mono,monospace" font-size="6.5">${hashes[i % hashes.length]}</text>`;
  }
  svg += `</svg>`;
  return svg;
}

export function renderLnMesh(width: number, height = 56): string {
  const c = 'oklch(0.82 0.17 95)';
  const halfPeriod = 34;
  const padX = 20;
  const cy = height / 2;
  const amp = height * 0.25;
  let groupCount = Math.floor((width - padX * 2) / halfPeriod) + 1;
  if (groupCount < 1) groupCount = 1;
  if (groupCount % 2 === 0) groupCount -= 1;
  const totalW = (groupCount - 1) * halfPeriod;
  const startX = (width - totalW) / 2;
  const groups: number[][] = [];
  const lnNodes: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < groupCount; i++) {
    const x = startX + i * halfPeriod;
    const group: number[] = [];
    if (i % 2 === 0) {
      group.push(lnNodes.length);
      lnNodes.push({ x, y: cy });
    } else {
      group.push(lnNodes.length);
      lnNodes.push({ x, y: cy - amp });
      group.push(lnNodes.length);
      lnNodes.push({ x, y: cy + amp });
    }
    groups.push(group);
  }
  const channels: Array<[number, number]> = [];
  for (let g = 0; g < groups.length - 1; g++) {
    groups[g].forEach((a) => {
      groups[g + 1].forEach((b) => {
        channels.push([a, b]);
      });
    });
  }
  let svg = `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;
  channels.forEach(([a, b]) => {
    const na = lnNodes[a], nb = lnNodes[b];
    svg += `<line x1="${na.x}" y1="${na.y}" x2="${nb.x}" y2="${nb.y}" stroke="${c}" stroke-opacity="0.30" stroke-width="0.8"/>`;
  });
  lnNodes.forEach((nd) => {
    svg += `<circle cx="${nd.x}" cy="${nd.y}" r="3.5" fill="hsla(210,70%,60%,0.15)" stroke="${c}" stroke-opacity="0.85" stroke-width="1"/>`;
  });
  svg += `</svg>`;
  return svg;
}
