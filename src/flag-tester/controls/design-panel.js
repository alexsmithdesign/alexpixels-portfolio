import { setSilkImage, getImageSrc, setPlacement, getPlacement, getCoverPlacement, setFlagCount, setSyncMode, setPoleColor } from '../flag/flag.js';
import { updateUIColor } from '../utils/color.js';

export function initDesignPanel() {
  initBgColor();
  initImageUpload();
  initPlacementModal();
  initPoleColor();
  initPreview();
  initToggles();
}

function initPreview() {
  const preview = document.getElementById('image-preview');
  const img = document.createElement('img');
  img.src = new URL('../assets/default-silk.png', import.meta.url).href;
  img.alt = 'Silk preview';
  img.draggable = false;
  preview.appendChild(img);
}

function initBgColor() {
  const input = document.getElementById('bg-color');
  input.addEventListener('input', () => {
    document.documentElement.style.setProperty('--bg-color', input.value);
    updateUIColor(input.value);
  });
}

function initImageUpload() {
  const uploadBtn = document.getElementById('upload-btn');
  const fileInput = document.getElementById('file-input');
  const fileError = document.getElementById('file-error');
  const preview = document.getElementById('image-preview');

  uploadBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      fileError.hidden = false;
      fileInput.value = '';
      return;
    }

    fileError.hidden = true;
    const url = URL.createObjectURL(file);
    setSilkImage(url);

    const previewImg = preview.querySelector('img');
    if (previewImg) {
      previewImg.src = url;
    }

    fileInput.value = '';
  });
}

function initPlacementModal() {
  const modal = document.getElementById('placement-modal');
  const overlay = document.getElementById('placement-overlay');
  const viewport = document.getElementById('placement-viewport');
  const imgWrapper = document.getElementById('placement-img-wrapper');
  const img = document.getElementById('placement-img');
  const confirmBtn = document.getElementById('placement-confirm');
  const cancelBtn = document.getElementById('placement-cancel');
  const editBtn = document.getElementById('edit-placement-btn');
  const zoomInBtn = document.getElementById('placement-zoom-in');
  const zoomOutBtn = document.getElementById('placement-zoom-out');

  let tempPlacement = { x: 0, y: 0, scale: 1 };
  let dragging = false;
  let dragStart = { x: 0, y: 0 };

  function open() {
    const src = getImageSrc();
    img.src = src;

    const onReady = () => {
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      img.style.width = natW + 'px';
      img.style.height = natH + 'px';

      const current = getPlacement();
      if (current) {
        tempPlacement = { ...current };
      } else {
        tempPlacement = getCoverPlacement(natW, natH);
      }
      applyTemp();
      modal.classList.add('is-open');
    };

    if (img.complete && img.naturalWidth) {
      onReady();
    } else {
      img.onload = onReady;
    }
  }

  function close() {
    modal.classList.remove('is-open');
    dragging = false;
  }

  function applyTemp() {
    imgWrapper.style.transform = `translate(${tempPlacement.x}px, ${tempPlacement.y}px) scale(${tempPlacement.scale})`;
  }

  editBtn.addEventListener('click', open);

  confirmBtn.addEventListener('click', () => {
    setPlacement(tempPlacement.x, tempPlacement.y, tempPlacement.scale);
    close();
  });

  cancelBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  viewport.addEventListener('mousedown', (e) => {
    dragging = true;
    dragStart = { x: e.clientX - tempPlacement.x, y: e.clientY - tempPlacement.y };
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    tempPlacement.x = e.clientX - dragStart.x;
    tempPlacement.y = e.clientY - dragStart.y;
    applyTemp();
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
  });

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.95 : 1.05;
    tempPlacement.scale = Math.max(0.05, Math.min(10, tempPlacement.scale * factor));
    applyTemp();
  }, { passive: false });

  zoomInBtn.addEventListener('click', () => {
    tempPlacement.scale = Math.min(10, tempPlacement.scale * 1.1);
    applyTemp();
  });

  zoomOutBtn.addEventListener('click', () => {
    tempPlacement.scale = Math.max(0.05, tempPlacement.scale * 0.9);
    applyTemp();
  });
}

function initToggles() {
  const count1 = document.getElementById('count-1');
  const count12 = document.getElementById('count-12');
  const syncSection = document.getElementById('sync-section');
  const syncUnison = document.getElementById('sync-unison');
  const syncAlternate = document.getElementById('sync-alternate');

  count1.addEventListener('click', () => {
    count1.classList.add('active');
    count12.classList.remove('active');
    setFlagCount(1);
    syncSection.hidden = true;
  });

  count12.addEventListener('click', () => {
    count12.classList.add('active');
    count1.classList.remove('active');
    setFlagCount(12);
    syncSection.hidden = false;
  });

  syncUnison.addEventListener('click', () => {
    syncUnison.classList.add('active');
    syncAlternate.classList.remove('active');
    setSyncMode('unison');
  });

  syncAlternate.addEventListener('click', () => {
    syncAlternate.classList.add('active');
    syncUnison.classList.remove('active');
    setSyncMode('alternate');
  });
}

function initPoleColor() {
  const input = document.getElementById('pole-color');
  input.addEventListener('input', () => {
    document.documentElement.style.setProperty('--pole-color', input.value);
    setPoleColor(input.value);
  });
}
