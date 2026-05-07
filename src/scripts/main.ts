// Boot — wires modules and starts the map.
// Static markup (nodes, panel details, empty state) comes from Astro.

import { layoutAll } from './nodes';
import { attachInteractions } from './interaction';
import { attachTweaks } from './tweaks';
import { watchHeight } from './iframe';

attachInteractions();
attachTweaks();
layoutAll();

let resizeTimer: ReturnType<typeof setTimeout> | undefined;
window.addEventListener('resize', () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(layoutAll, 80);
});

watchHeight();
