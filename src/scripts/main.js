// Boot — wires all modules and starts the map.

import { renderNodes, layoutAll } from './nodes.js';
import { attachPanelClose } from './interaction.js';
import { renderEmptyPanel } from './panel.js';
import { attachTweaks, applyToggles } from './tweaks.js';
import { watchHeight } from './iframe.js';

renderNodes();
layoutAll();
attachPanelClose();
attachTweaks();
applyToggles();
renderEmptyPanel();

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(layoutAll, 80);
});

watchHeight();
