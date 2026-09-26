import { createApp } from 'vue';
import SnowOverlay from '../components/SnowOverlay.vue';

/** Mount seasonal snow overlay (caller gates on December + reduced-motion). */
export function setupSnow(): void {
  if (document.getElementById('snow-overlay-root')) return;

  const container = document.createElement('div');
  container.id = 'snow-overlay-root';
  document.body.appendChild(container);

  createApp(SnowOverlay).mount(container);
}
