import { initFlag } from './flag/flag.js';
import { initBpm } from './controls/bpm.js';
import { initDesignPanel } from './controls/design-panel.js';
import { initZoom } from './controls/zoom.js';
import { updateUIColor } from './utils/color.js';

async function init() {
  updateUIColor('#1E562B');
  await initFlag();
  initBpm();
  initDesignPanel();
  initZoom();
  document.getElementById('loading-screen').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', init);
