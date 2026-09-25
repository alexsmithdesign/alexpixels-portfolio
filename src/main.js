import './style.css';

/* ===============================
   TYPEWRITER EFFECT
================================ */
function prepareTypewriter(el) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('data-tw-ready', '');
  for (const char of text) {
    const span = document.createElement('span');
    span.className = 'tw-char';
    span.textContent = char === ' ' ? ' ' : char;
    el.appendChild(span);
  }
}

function runTypewriter(el, charDelay = 30) {
  return new Promise(resolve => {
    const chars = el.querySelectorAll('.tw-char');
    if (!chars.length) { resolve(); return; }
    let i = 0;
    let lastTime = 0;
    function step(timestamp) {
      if (!lastTime) lastTime = timestamp;
      while (i < chars.length && timestamp - lastTime >= charDelay) {
        chars[i].classList.add('tw-visible');
        i++;
        lastTime += charDelay;
      }
      if (i < chars.length) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}

/* ===============================
   PREPARE TYPEWRITER TARGETS
================================ */
document.querySelectorAll('.fade-in-section').forEach(section => {
  section.querySelectorAll('.section-title').forEach(el => prepareTypewriter(el));
});

/* ===============================
   SCROLL FADE-IN SECTIONS
================================ */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      const cards = entry.target.querySelectorAll('.case-study-card');
      cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), i * 150);
      });

      const sectionTitle = entry.target.querySelector('.section-title');
      if (sectionTitle) {
        setTimeout(() => runTypewriter(sectionTitle, 30), 200);
      }

      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -15% 0px' });

const fadeSections = Array.from(document.querySelectorAll('.fade-in-section'));
fadeSections.forEach(el => fadeObserver.observe(el));

requestAnimationFrame(() => {
  let delay = 0;
  fadeSections.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0 && !el.classList.contains('visible')) {
      setTimeout(() => {
        el.classList.add('visible');
        const sectionTitle = el.querySelector('.section-title');
        if (sectionTitle) setTimeout(() => runTypewriter(sectionTitle, 30), 200);
        fadeObserver.unobserve(el);
      }, delay);
      delay += 250;
    }
  });
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

  if (!galleryEl || !dotsContainer || !btnLeft || !btnRight || !items.length) return;

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
   ART GALLERY ACCORDION
================================ */
const artGalleryToggle = document.querySelector('.art-gallery-toggle');
const artGalleryCollapsible = document.querySelector('.art-gallery-collapsible');
if (artGalleryToggle && artGalleryCollapsible) {
  function toggleArtGallery() {
    const isOpen = artGalleryCollapsible.classList.toggle('open');
    artGalleryToggle.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
      galleryInstances.forEach(g => g.resize());
    }
  }
  artGalleryToggle.addEventListener('click', toggleArtGallery);
  artGalleryToggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleArtGallery();
    }
  });
}

/* ===============================
   GALLERY LIGHTBOX
================================ */
const lightbox = document.getElementById('gallery-lightbox');
const lightboxImg = document.getElementById('gallery-lightbox-img');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

let lightboxImages = [];
let lightboxIndex = 0;

function updateLightboxArrows() {
  lightboxPrev.hidden = lightboxIndex <= 0;
  lightboxNext.hidden = lightboxIndex >= lightboxImages.length - 1;
}

function openLightbox(src) {
  const allImgs = Array.from(document.querySelectorAll('.gallery-image-wrapper:not([data-case-study]) img'));
  lightboxImages = allImgs.map(img => img.src);
  lightboxIndex = lightboxImages.indexOf(src);
  if (lightboxIndex === -1) lightboxIndex = 0;
  lightboxImg.src = src;
  updateLightboxArrows();
  requestAnimationFrame(() => lightbox.classList.add('visible'));
}

function closeLightbox() {
  lightbox.classList.remove('visible', 'zoomed');
  lightbox.addEventListener('transitionend', () => {
    lightboxImg.src = '';
  }, { once: true });
}

function lightboxNav(dir) {
  const next = lightboxIndex + dir;
  if (next < 0 || next >= lightboxImages.length) return;
  lightboxIndex = next;
  lightbox.classList.remove('zoomed');
  lightboxImg.src = lightboxImages[lightboxIndex];
  updateLightboxArrows();
}

document.querySelectorAll('.gallery-image-wrapper:not([data-case-study]) img').forEach(img => {
  img.style.cursor = 'pointer';
  img.addEventListener('click', () => openLightbox(img.src));
});

lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); lightboxNav(-1); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); lightboxNav(1); });

lightboxImg.addEventListener('click', (e) => {
  e.stopPropagation();
  lightbox.classList.toggle('zoomed');
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.getElementById('lightbox-close').addEventListener('click', (e) => {
  e.stopPropagation();
  closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('visible')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
});

/* ===============================
   SHOP CUSTOM SCROLLBARS
================================ */
document.querySelectorAll('.shop-category').forEach(category => {
  const scrollContainer = category.querySelector('.shop-items-scroll');
  const scrollbar = category.querySelector('.shop-scrollbar');
  if (!scrollContainer || !scrollbar) return;

  const track = scrollbar.querySelector('.shop-scrollbar__track');
  const thumb = scrollbar.querySelector('.shop-scrollbar__thumb');

  function getScrollRatio() {
    const max = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    return max > 0 ? scrollContainer.scrollLeft / max : 0;
  }

  function updateThumb() {
    const max = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    if (max <= 0) {
      scrollbar.classList.add('hidden');
      return;
    }
    scrollbar.classList.remove('hidden');
    const pct = getScrollRatio() * 100;
    thumb.style.left = pct + '%';
  }

  scrollContainer.addEventListener('scroll', () => {
    if (!isDragging) updateThumb();
  });

  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;

  thumb.addEventListener('mousedown', e => {
    e.preventDefault();
    isDragging = true;
    dragStartX = e.clientX;
    dragStartScroll = scrollContainer.scrollLeft;
    thumb.style.transition = 'none';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const trackWidth = track.getBoundingClientRect().width;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const dx = e.clientX - dragStartX;
    const scrollDelta = (dx / trackWidth) * maxScroll;
    scrollContainer.scrollLeft = dragStartScroll + scrollDelta;
    const pct = (scrollContainer.scrollLeft / maxScroll) * 100;
    thumb.style.left = pct + '%';
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    thumb.style.transition = '';
    document.body.style.userSelect = '';
  });

  thumb.addEventListener('touchstart', e => {
    isDragging = true;
    dragStartX = e.touches[0].clientX;
    dragStartScroll = scrollContainer.scrollLeft;
    thumb.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const trackWidth = track.getBoundingClientRect().width;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const dx = e.touches[0].clientX - dragStartX;
    const scrollDelta = (dx / trackWidth) * maxScroll;
    scrollContainer.scrollLeft = dragStartScroll + scrollDelta;
    const pct = (scrollContainer.scrollLeft / maxScroll) * 100;
    thumb.style.left = pct + '%';
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    thumb.style.transition = '';
  });

  track.addEventListener('click', e => {
    if (e.target === thumb) return;
    const rect = track.getBoundingClientRect();
    const clickPct = (e.clientX - rect.left) / rect.width;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    scrollContainer.scrollLeft = clickPct * maxScroll;
    updateThumb();
  });

  updateThumb();
  window.addEventListener('resize', updateThumb);
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
  { el: document.getElementById('shop'), id: 'shop', message: "Alex sells assets online for developers. Pretty neat, huh?" },
  { el: document.getElementById('gallery'), id: 'gallery', message: "Welcome to the portfolio of Alex Smith! Please check out their work!" },
  { el: document.getElementById('about'), id: 'about', message: "Meet my creator!" },
];

let entryComplete = false;
let currentSectionId = null;
let walkTimer = null;
let bubbleDismissed = false;

spriteCompanion.addEventListener('click', () => {
  if (spriteBubble.classList.contains('visible')) {
    hideBubble();
    bubbleDismissed = true;
    setTimeout(() => { bubbleDismissed = false; }, 2000);
  }
});

function showBubble(text) {
  if (bubbleDismissed) return;
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

/* ===============================
   3D SPACE ID CARD
================================ */
const spaceidCard = document.getElementById('spaceid-card');
const spaceidGlare = document.getElementById('spaceid-glare');

if (spaceidCard) {
  const MAX_TILT = 15;

  function applyTilt(xPct, yPct) {
    const rotateY = (xPct - 0.5) * MAX_TILT * 2;
    const rotateX = (0.5 - yPct) * MAX_TILT * 2;
    spaceidCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    spaceidGlare.style.background = `radial-gradient(circle at ${xPct * 100}% ${yPct * 100}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 30%, transparent 60%)`;
  }

  function resetTilt() {
    spaceidCard.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    spaceidCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
    spaceidGlare.style.opacity = '0';
    spaceidCard.classList.remove('active');
  }

  spaceidCard.addEventListener('mouseenter', () => {
    spaceidCard.style.transition = 'transform 0.15s ease-out';
    spaceidGlare.style.opacity = '1';
  });

  spaceidCard.addEventListener('mousemove', (e) => {
    const rect = spaceidCard.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;
    applyTilt(xPct, yPct);
  });

  spaceidCard.addEventListener('mouseleave', resetTilt);

  spaceidCard.addEventListener('touchstart', (e) => {
    spaceidCard.style.transition = 'transform 0.15s ease-out';
    spaceidGlare.style.opacity = '1';
    spaceidCard.classList.add('active');
  }, { passive: true });

  spaceidCard.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = spaceidCard.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const yPct = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));
    applyTilt(xPct, yPct);
  }, { passive: true });

  spaceidCard.addEventListener('touchend', resetTilt);
}

/* ===============================
   EMAIL SUBSCRIBE FORM
================================ */
const subscribeForm = document.getElementById('subscribe-form');
const subscribeMessage = document.getElementById('subscribe-message');

if (subscribeForm) {
  subscribeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = subscribeForm.email.value.trim();
    if (!email) return;

    subscribeMessage.textContent = 'Subscribing...';
    subscribeMessage.className = 'subscribe-message';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        subscribeMessage.textContent = data.message;
        subscribeMessage.classList.add('success');
        subscribeForm.reset();
      } else {
        subscribeMessage.textContent = data.error || 'Something went wrong';
        subscribeMessage.classList.add('error');
      }
    } catch {
      subscribeMessage.textContent = 'Network error. Please try again.';
      subscribeMessage.classList.add('error');
    }
  });
}
