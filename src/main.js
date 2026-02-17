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
   HERO GALLERY + DOTS (SINGLE SYSTEM)
================================ */
const gallery = document.querySelector('.gallery-images');
const items = Array.from(document.querySelectorAll('.gallery-image-wrapper'));
const dotsContainer = document.querySelector('.gallery-dots');
const btnLeft = document.querySelector('.gallery-arrow-left');
const btnRight = document.querySelector('.gallery-arrow-right');

let currentIndex = 0;
let visibleCount = window.innerWidth <= 768 ? 1 : 5;

// Build dots (ONE per image)
dotsContainer.innerHTML = '';
items.forEach(() => {
  const dot = document.createElement('div');
  dot.className = 'gallery-dot';
  dotsContainer.appendChild(dot);
});

const dots = Array.from(document.querySelectorAll('.gallery-dot'));

function getMaxIndex() {
  return Math.max(0, items.length - visibleCount);
}

function updateGallery() {
  const itemWidth = items[0].offsetWidth;
  gallery.style.transform = `translateX(${-currentIndex * itemWidth}px)`;

  // Update dots
  dots.forEach((dot, i) => {
    dot.classList.remove('active');

    // MOBILE: only one active dot
    if (visibleCount === 1) {
      if (i === currentIndex) dot.classList.add('active');
    }
    // DESKTOP: active range = visible items
    else {
      if (i >= currentIndex && i < currentIndex + visibleCount) {
        dot.classList.add('active');
      }
    }
  });

  // Arrow states
  btnLeft.classList.toggle('disabled', currentIndex === 0);
  btnRight.classList.toggle('disabled', currentIndex === getMaxIndex());
}

// Arrow controls
btnLeft.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateGallery();
  }
});

btnRight.addEventListener('click', () => {
  if (currentIndex < getMaxIndex()) {
    currentIndex++;
    updateGallery();
  }
});

// Dot click navigation
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    currentIndex = Math.min(i, getMaxIndex());
    updateGallery();
  });
});

// Resize handling
window.addEventListener('resize', () => {
  visibleCount = window.innerWidth <= 768 ? 1 : 5;
  currentIndex = Math.min(currentIndex, getMaxIndex());
  updateGallery();
});

// Init
updateGallery();

/* ===============================
   GALLERY LIGHTBOX
================================ */
const lightbox = document.getElementById('gallery-lightbox');
const lightboxImg = document.getElementById('gallery-lightbox-img');

items.forEach(wrapper => {
  const img = wrapper.querySelector('img');
  img.style.cursor = 'pointer';

  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.remove('hidden');
  });
});

lightbox.addEventListener('click', () => {
  lightbox.classList.add('hidden');
  lightboxImg.src = '';
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    lightbox.classList.add('hidden');
    lightboxImg.src = '';
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
