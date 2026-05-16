import './style.css';

/* ===============================
   PARALLAX BACKGROUND
================================ */
let ticking = false;

function updateParallax() {
  const scrolled = window.pageYOffset;
  document.documentElement.style.setProperty(
    '--parallax-y',
    `${scrolled * 0.4}px`
  );
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateParallax);
    ticking = true;
  }
});

/* ===============================
   GALLERY INSTANCES (multi-row)
================================ */
const galleryInstances = [];

document.querySelectorAll('.gallery-instance').forEach(instance => {
  const galleryEl = instance.querySelector('.gallery-images');
  const items = Array.from(instance.querySelectorAll('.gallery-image-wrapper'));
  const dotsContainer = instance.querySelector('.gallery-dots');
  const btnLeft = instance.querySelector('.gallery-arrow-left');
  const btnRight = instance.querySelector('.gallery-arrow-right');

  if (!items.length) return;

  let currentIndex = 0;
  let visibleCount = window.innerWidth <= 768 ? 1 : 5;

  dotsContainer.innerHTML = '';
  items.forEach(() => {
    const dot = document.createElement('div');
    dot.className = 'gallery-dot';
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.gallery-dot'));

  function getMaxIndex() {
    return Math.max(0, items.length - visibleCount);
  }

  function update() {
    const itemWidth = items[0].offsetWidth;
    galleryEl.style.transform = `translateX(${-currentIndex * itemWidth}px)`;

    dots.forEach((dot, i) => {
      dot.classList.remove('active');
      if (visibleCount === 1) {
        if (i === currentIndex) dot.classList.add('active');
      } else {
        if (i >= currentIndex && i < currentIndex + visibleCount) {
          dot.classList.add('active');
        }
      }
    });

    btnLeft.classList.toggle('disabled', currentIndex === 0);
    btnRight.classList.toggle('disabled', currentIndex === getMaxIndex());
  }

  btnLeft.addEventListener('click', () => {
    if (currentIndex > 0) { currentIndex--; update(); }
  });

  btnRight.addEventListener('click', () => {
    if (currentIndex < getMaxIndex()) { currentIndex++; update(); }
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      currentIndex = Math.min(i, getMaxIndex());
      update();
    });
  });

  galleryInstances.push({ update, resize() {
    visibleCount = window.innerWidth <= 768 ? 1 : 5;
    currentIndex = Math.min(currentIndex, getMaxIndex());
    update();
  }});

  update();
});

window.addEventListener('resize', () => {
  galleryInstances.forEach(g => g.resize());
});

/* ===============================
   GALLERY LIGHTBOX
================================ */
const lightbox = document.getElementById('gallery-lightbox');
const lightboxImg = document.getElementById('gallery-lightbox-img');

function openLightbox(src) {
  lightboxImg.src = src;
  requestAnimationFrame(() => lightbox.classList.add('visible'));
}

function closeLightbox() {
  lightbox.classList.remove('visible');
  lightbox.addEventListener('transitionend', () => {
    lightboxImg.src = '';
  }, { once: true });
}

document.querySelectorAll('.gallery-image-wrapper img').forEach(img => {
  img.style.cursor = 'pointer';
  img.addEventListener('click', () => openLightbox(img.src));
});

lightbox.addEventListener('click', closeLightbox);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightbox.classList.contains('visible')) {
    closeLightbox();
  }
});

/* ===============================
   SOLAR REQUIEM THUMBNAILS
================================ */
const solarMainImage = document.getElementById('solarMainImage');
const solarThumbnails = document.querySelectorAll('.solar-thumbnail');

solarThumbnails.forEach(thumbnail => {
  thumbnail.addEventListener('click', () => {
    solarThumbnails.forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
    solarMainImage.src = thumbnail.dataset.main;
  });
});

/* ===============================
   SMOOTH SCROLL
================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===============================
   EMAIL COPY TO CLIPBOARD
================================ */
document.querySelectorAll('.email-icon-btn').forEach(btn => {
  let timeout1, timeout2;
  btn.addEventListener('click', () => {
    const tooltip = btn.querySelector('.email-tooltip');
    clearTimeout(timeout1);
    clearTimeout(timeout2);
    navigator.clipboard.writeText('design.alexsmith@gmail.com');
    tooltip.classList.remove('fade-out');
    tooltip.classList.add('visible');
    timeout1 = setTimeout(() => {
      tooltip.classList.add('fade-out');
      timeout2 = setTimeout(() => {
        tooltip.classList.remove('visible', 'fade-out');
      }, 500);
    }, 2500);
  });
});

/* ===============================
   SPRITE COMPANION
================================ */
const spriteCompanion = document.getElementById('sprite-companion');
const spriteCharacter = document.getElementById('sprite-character');
const spriteBubble = document.getElementById('sprite-bubble');
const spriteBubbleText = document.getElementById('sprite-bubble-text');

const FRAME_SIZE = 128;
const isMobile = () => window.innerWidth <= 768;

function setSpriteFrame(col, row) {
  const size = isMobile() ? 96 : FRAME_SIZE;
  const scale = size / FRAME_SIZE;
  spriteCharacter.style.backgroundPosition =
    `${-col * FRAME_SIZE * scale}px ${-row * FRAME_SIZE * scale}px`;
}

const sectionConfig = [
  { el: document.querySelector('.hero-collage'), id: 'hero', message: "Welcome to the Design Studio of Alex! Have a look around." },
  { el: document.getElementById('gallery'), id: 'gallery', message: "Check out their work! Wow!" },
  { el: document.getElementById('solar-requiem'), id: 'solar-requiem', message: "Hey, look! I'm in this game! Looks fun, right?" },
  { el: document.getElementById('shop'), id: 'shop', message: "Ooh, the shop!" },
  { el: document.getElementById('about'), id: 'about', message: "Meet my creator!" },
];

let entryComplete = false;
let currentSectionId = null;
let walkTimer = null;

function showBubble(text) {
  spriteBubbleText.textContent = text;
  spriteBubble.classList.add('visible');
}

function hideBubble() {
  spriteBubble.classList.remove('visible');
}

const visibilityMap = new Map();

function updateActiveBubble() {
  let active = null;
  for (const section of sectionConfig) {
    if (section.el && visibilityMap.get(section.el)) {
      active = section;
    }
  }

  if (active && currentSectionId !== active.id) {
    currentSectionId = active.id;
    hideBubble();
    setTimeout(() => showBubble(active.message), 400);
  } else if (!active && currentSectionId) {
    currentSectionId = null;
    hideBubble();
  }
}

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    visibilityMap.set(entry.target, entry.isIntersecting);
  });
  if (entryComplete) updateActiveBubble();
}, { threshold: 0.3 });

sectionConfig.forEach(s => {
  if (s.el) {
    visibilityMap.set(s.el, false);
    sectionObserver.observe(s.el);
  }
});

let lastScrollY = window.scrollY;
let scrollAccum = 0;
let scrollPingPongIdx = 0;
let scrollIdleTimer = null;
let lastFrameTime = 0;
const SCROLL_PER_FRAME = 40;
const MIN_FRAME_INTERVAL = 140;
const PING_PONG = [1, 0, 1, 2];

window.addEventListener('scroll', () => {
  if (!entryComplete) return;

  const currentY = window.scrollY;
  const delta = Math.abs(currentY - lastScrollY);
  const direction = currentY > lastScrollY ? 'down' : 'up';
  lastScrollY = currentY;

  scrollAccum += delta;
  const now = performance.now();
  if (scrollAccum >= SCROLL_PER_FRAME && now - lastFrameTime >= MIN_FRAME_INTERVAL) {
    scrollAccum = 0;
    lastFrameTime = now;
    scrollPingPongIdx = (scrollPingPongIdx + 1) % PING_PONG.length;
    const row = direction === 'down' ? 0 : 3;
    setSpriteFrame(PING_PONG[scrollPingPongIdx], row);
  }

  clearTimeout(scrollIdleTimer);
  scrollIdleTimer = setTimeout(() => {
    setSpriteFrame(1, 0);
    scrollAccum = 0;
    scrollPingPongIdx = 0;
  }, 150);
});

function startEntry() {
  let entryIdx = 0;
  setSpriteFrame(PING_PONG[0], 1);

  walkTimer = setInterval(() => {
    entryIdx = (entryIdx + 1) % PING_PONG.length;
    setSpriteFrame(PING_PONG[entryIdx], 1);
  }, 160);

  requestAnimationFrame(() => {
    spriteCompanion.classList.add('entered');
  });

  spriteCompanion.addEventListener('transitionend', function onEntry(e) {
    if (e.propertyName !== 'transform') return;
    spriteCompanion.removeEventListener('transitionend', onEntry);
    clearInterval(walkTimer);
    setSpriteFrame(1, 0);

    setTimeout(() => {
      entryComplete = true;
      lastScrollY = window.scrollY;
      updateActiveBubble();
    }, 300);
  });
}

setTimeout(startEntry, 800);
