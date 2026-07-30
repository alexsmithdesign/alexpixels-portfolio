import { setZoom } from '../flag/flag.js';

let zoom = 100;

export function initZoom() {
  const zoomIn = document.getElementById('zoom-in');
  const zoomOut = document.getElementById('zoom-out');

  zoomIn.addEventListener('click', () => {
    if (zoom < 200) {
      zoom += 10;
      setZoom(zoom);
    }
  });

  zoomOut.addEventListener('click', () => {
    if (zoom > 50) {
      zoom -= 10;
      setZoom(zoom);
    }
  });
}
