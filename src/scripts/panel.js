// Side panel rendering.

import { NODES, CATEGORIES, S, panelInner } from './data.js';
import { LOGOS } from './logos.js';

export function renderPanel(id) {
  const n = NODES.find((x) => x.id === id);
  if (!n) { renderEmptyPanel(); return; }

  const cat = n.category ? CATEGORIES[n.category] : null;
  const catColor = cat ? `var(${cat.css})` : 'var(--btc)';

  panelInner.style.setProperty('--cat', catColor);
  panelInner.innerHTML = `
    <div class="tag" style="--cat:${catColor}; border-color:${catColor}; color:${catColor};">
      ${n.id === 'btc' ? S.l1Tag : cat.label}
    </div>
    <h2>${n.name}</h2>
    ${n.subtitle ? `<div class="subtitle">${n.subtitle}</div>` : ''}
    <div class="tagline">${n.tagline}</div>
    <div class="logo-slot">
      ${LOGOS[n.id] ? LOGOS[n.id].detail(80, 80) : `[ ${n.name} ]`}
    </div>
    ${n.body.split('\n\n').map((p, i) => `<p class="body${i > 0 ? ' body-cont' : ''}">${p}</p>`).join('')}
    <a class="read-more" href="${n.learnMore || '#'}" target="_blank" rel="noopener">${S.readMore} ${n.name} →</a>
    <dl class="specs">
      <dt>${S.roleLabel}</dt><dd>${n.short}</dd>
      <dt>${S.consensusLabel}</dt><dd class="mono">${n.consensus}</dd>
      ${n.bridge ? `<dt>${S.bridgeLabel}</dt><dd>${n.bridge}</dd>` : ''}
    </dl>
    ${n.bridgePath ? `
      <div class="bridge-line">
        <div class="lbl">${S.pegMechanism}</div>
        <div class="bridge-diagram">
          ${n.bridgePath.map((h, i) => `
            <div class="hop ${i === 0 ? 'btc' : ''}">${h}</div>
            ${i < n.bridgePath.length - 1 ? '<div class="arrow"></div>' : ''}
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

export function renderEmptyPanel() {
  panelInner.innerHTML = `
    <div class="empty">
      <h3>${S.readMap}</h3>
      <p>${S.readMapBody}<em>${S.readMapEm}</em>.</p>
      <div class="legend">
        <h3>${S.legendTitle}</h3>
        <div class="legend-row"><svg width="40" height="6"><line x1="0" y1="3" x2="40" y2="3" stroke="#aaa" stroke-width="1"/></svg><span>${S.legendNative}</span></div>
        <div class="legend-row"><svg width="40" height="6"><line x1="0" y1="3" x2="40" y2="3" stroke="#aaa" stroke-width="1" stroke-dasharray="4 4"/></svg><span>${S.legendFederated}</span></div>
        <div class="legend-row"><svg width="40" height="6"><line x1="0" y1="3" x2="40" y2="3" stroke="#aaa" stroke-width="1" stroke-dasharray="1.5 4"/></svg><span>${S.legendLN}</span></div>
        <div class="legend-row"><svg width="40" height="6"><line x1="0" y1="3" x2="40" y2="3" stroke="#aaa" stroke-width="1" stroke-dasharray="10 5"/></svg><span>${S.legendCrypto}</span></div>
      </div>
    </div>`;
}
