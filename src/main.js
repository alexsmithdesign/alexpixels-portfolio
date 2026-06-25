import './style.css';

/* ===============================
   WARP SPEED STARFIELD
================================ */
const starCanvas = document.getElementById('starfield');
const starCtx = starCanvas.getContext('2d');
const STAR_COUNT = window.innerWidth <= 768 ? 150 : 300;
const SPEED = 2;
const MAX_DEPTH = 1500;
let stars = [];

function resizeStarfield() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
}

function createStar(zOverride) {
  return {
    x: (Math.random() - 0.5) * starCanvas.width * 2,
    y: (Math.random() - 0.5) * starCanvas.height * 2,
    z: zOverride !== undefined ? zOverride : Math.random() * MAX_DEPTH,
  };
}

function initStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(createStar());
  }
}

function drawStarfield() {
  const w = starCanvas.width;
  const h = starCanvas.height;
  const cx = w / 2;
  const cy = h / 2;

  starCtx.fillStyle = '#000';
  starCtx.fillRect(0, 0, w, h);

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    star.z -= SPEED;

    if (star.z <= 1) {
      stars[i] = createStar(MAX_DEPTH);
      continue;
    }

    const sx = (star.x / star.z) * 200 + cx;
    const sy = (star.y / star.z) * 200 + cy;

    if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) {
      stars[i] = createStar(MAX_DEPTH);
      continue;
    }

    const prevZ = star.z + SPEED;
    const px = (star.x / prevZ) * 200 + cx;
    const py = (star.y / prevZ) * 200 + cy;

    const depth = 1 - star.z / MAX_DEPTH;
    const alpha = depth * 0.9 + 0.1;
    const thickness = depth * 2.5 + 0.5;

    const r = 200 + Math.round(55 * depth);
    const g = 220 + Math.round(35 * depth);
    const b = 255;

    starCtx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    starCtx.lineWidth = thickness;
    starCtx.beginPath();
    starCtx.moveTo(px, py);
    starCtx.lineTo(sx, sy);
    starCtx.stroke();

    if (depth > 0.85) {
      starCtx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
      starCtx.shadowBlur = 8;
      starCtx.beginPath();
      starCtx.arc(sx, sy, thickness, 0, Math.PI * 2);
      starCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      starCtx.fill();
      starCtx.shadowBlur = 0;
    }
  }

  requestAnimationFrame(drawStarfield);
}

resizeStarfield();
initStars();
requestAnimationFrame(drawStarfield);

window.addEventListener('resize', () => {
  resizeStarfield();
});

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
const heroSubtitle = document.querySelector('.hero-subtitle');
const heroHeadline = document.querySelector('.hero-headline');

if (heroSubtitle) prepareTypewriter(heroSubtitle);
if (heroHeadline) prepareTypewriter(heroHeadline);

document.querySelectorAll('.fade-in-section').forEach(section => {
  section.querySelectorAll('.section-title').forEach(el => prepareTypewriter(el));
});

/* ===============================
   HERO ANIMATIONS (page load)
================================ */
const heroSocialIcons = document.querySelectorAll('main .social-icon');

setTimeout(() => {
  if (heroSubtitle) {
    runTypewriter(heroSubtitle, 25).then(() => {
      if (heroHeadline) {
        runTypewriter(heroHeadline, 30).then(() => {
          heroSocialIcons.forEach((icon, i) => {
            setTimeout(() => icon.classList.add('icon-animate'), i * 120);
          });
        });
      }
    });
  }
}, 500);

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

document.querySelectorAll('.fade-in-section').forEach(el => {
  fadeObserver.observe(el);
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

document.querySelectorAll('.gallery-image-wrapper:not([data-case-study]) img').forEach(img => {
  img.style.cursor = 'pointer';
  img.addEventListener('click', () => openLightbox(img.src));
});

lightbox.addEventListener('click', closeLightbox);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (caseStudyOverlay.classList.contains('visible')) {
      closeCaseStudy();
    } else if (lightbox.classList.contains('visible')) {
      closeLightbox();
    }
  }
});


/* ===============================
   CASE STUDY OVERLAY
================================ */
const caseStudyOverlay = document.getElementById('case-study-overlay');
const caseStudyContent = caseStudyOverlay.querySelector('.case-study-content');
const caseStudyName = caseStudyOverlay.querySelector('.case-study-project-name');
const caseStudyBackBtn = caseStudyOverlay.querySelector('.case-study-back');
const caseStudyNextBtn = caseStudyOverlay.querySelector('.case-study-next');

const projects = [
  { id: 'crossmen-rebrand', name: 'Crossmen Rebrand' },
  { id: 'solar-requiem', name: 'Solar Requiem' },
  { id: 'veyne', name: 'Veyne' },
  { id: 'untune', name: 'Untune' },
  { id: 'web-design', name: 'Web Design' },
  { id: 'sumo-visa-pushnami', name: 'Sumo, Visa, Pushnami' }
];

let currentProjectIndex = 0;

async function openCaseStudy(projectId, pushState = true) {
  const index = projects.findIndex(p => p.id === projectId);
  if (index === -1) return;
  currentProjectIndex = index;
  await loadCaseStudyContent(projects[index]);
  caseStudyOverlay.scrollTop = 0;
  csScrollbarThumb.style.top = '0%';
  requestAnimationFrame(() => caseStudyOverlay.classList.add('visible'));
  document.body.style.overflow = 'hidden';
  if (pushState) history.pushState(null, '', `/${projectId}`);
  updateScrollbarHashes();
}

async function loadCaseStudyContent(project) {
  caseStudyName.textContent = project.name;
  try {
    const res = await fetch(`/case-studies/${project.id}.html`);
    const html = await res.text();
    caseStudyContent.innerHTML = html;
  } catch {
    caseStudyContent.innerHTML = '<p style="color:#fff;">Failed to load content.</p>';
  }
}

function closeCaseStudy() {
  caseStudyOverlay.classList.remove('visible');
  document.body.style.overflow = '';
  history.pushState(null, '', '/');
  caseStudyOverlay.addEventListener('transitionend', () => {
    caseStudyContent.innerHTML = '';
  }, { once: true });
}

const csScrollbarThumb = document.querySelector('.cs-scrollbar__thumb');
const csScrollbarTrack = document.querySelector('.cs-scrollbar__track');

function updateScrollbarHashes() {
  csScrollbarTrack.querySelectorAll('.cs-scrollbar__hash').forEach(h => h.remove());
  requestAnimationFrame(() => {
    const scrollRange = caseStudyOverlay.scrollHeight - caseStudyOverlay.clientHeight;
    if (scrollRange <= 0) return;
    caseStudyContent.querySelectorAll('.case-study-headline').forEach(el => {
      const pct = (el.offsetTop / scrollRange) * 100;
      const hash = document.createElement('div');
      hash.className = 'cs-scrollbar__hash';
      hash.style.top = pct + '%';
      csScrollbarTrack.appendChild(hash);
    });
  });
}

caseStudyOverlay.addEventListener('scroll', () => {
  const scrollTop = caseStudyOverlay.scrollTop;
  const scrollHeight = caseStudyOverlay.scrollHeight - caseStudyOverlay.clientHeight;
  if (scrollHeight > 0) {
    const pct = (scrollTop / scrollHeight) * 100;
    csScrollbarThumb.style.top = pct + '%';
  }
});

caseStudyBackBtn.addEventListener('click', closeCaseStudy);

caseStudyNextBtn.addEventListener('click', async () => {
  currentProjectIndex = (currentProjectIndex + 1) % projects.length;
  caseStudyContent.style.opacity = '0';
  await new Promise(r => setTimeout(r, 200));
  await loadCaseStudyContent(projects[currentProjectIndex]);
  caseStudyOverlay.scrollTop = 0;
  csScrollbarThumb.style.top = '0%';
  caseStudyContent.style.opacity = '1';
  history.pushState(null, '', `/${projects[currentProjectIndex].id}`);
  updateScrollbarHashes();
});

document.querySelectorAll('[data-case-study]').forEach(wrapper => {
  wrapper.style.cursor = 'pointer';
  wrapper.addEventListener('click', () => {
    openCaseStudy(wrapper.dataset.caseStudy);
  });
});

window.addEventListener('popstate', () => {
  const path = window.location.pathname.replace(/^\//, '');
  const match = projects.find(p => p.id === path);
  if (match) {
    openCaseStudy(match.id, false);
  } else if (caseStudyOverlay.classList.contains('visible')) {
    caseStudyOverlay.classList.remove('visible');
    document.body.style.overflow = '';
    caseStudyContent.innerHTML = '';
  }
});

(function handleInitialRoute() {
  const path = window.location.pathname.replace(/^\//, '');
  const match = projects.find(p => p.id === path);
  if (match) openCaseStudy(match.id, false);
})();

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
  { el: document.querySelector('.hero-collage'), id: 'hero', message: "Welcome! Have a look around." },
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
