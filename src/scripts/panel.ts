// Side panel: toggles which pre-rendered detail is visible.
// All 11 details and the empty state are static HTML rendered by Astro.

import { panel, panelInner } from './dom';

const allDetails = panelInner.querySelectorAll<HTMLElement>('.panel-detail');
const empty = panelInner.querySelector<HTMLElement>('.panel-empty')!;

export function showPanelDetail(id: string | null): void {
  panelInner.classList.toggle('has-active', !!id);
  allDetails.forEach((el) => {
    el.hidden = el.dataset.id !== id;
  });
  empty.hidden = !!id;
  panel.scrollTop = 0;
}
