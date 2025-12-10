import { createApp } from 'vue';
import SnowOverlay from '../components/SnowOverlay.vue';

export function setupSnow() {
  if (typeof window === 'undefined') return;
  
  // Check if snow overlay already exists
  if (document.getElementById('snow-overlay-root')) return;
  
  // Create container for snow overlay
  const container = document.createElement('div');
  container.id = 'snow-overlay-root';
  document.body.appendChild(container);
  
  // Mount the snow overlay component
  const snowApp = createApp(SnowOverlay);
  snowApp.mount(container);
}

