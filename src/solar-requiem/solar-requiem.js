import './solar-requiem.css';

/* ===============================
   NAV — Active State on Scroll
================================ */
const navLinks = document.querySelectorAll('.sr-nav-link');
const navSectionIds = ['home', 'gallery', 'characters', 'story-setting', 'battle-system', 'join-waitlist'];
const navSections = navSectionIds.map(id => document.getElementById(id)).filter(Boolean);

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, {
  rootMargin: '-20% 0px -80% 0px'
});

navSections.forEach(section => navObserver.observe(section));

/* ===============================
   NAV — Smooth Scroll
================================ */
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===============================
   MOBILE MENU
================================ */
const hamburger = document.getElementById('sr-nav-hamburger');
const mobileMenu = document.getElementById('sr-mobile-menu');
const mobileOverlay = document.getElementById('sr-mobile-overlay');
const mobileClose = document.getElementById('sr-mobile-close');

function openMobileMenu() {
  mobileMenu.classList.add('open');
  mobileOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  mobileOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', openMobileMenu);
mobileClose?.addEventListener('click', closeMobileMenu);
mobileOverlay?.addEventListener('click', closeMobileMenu);

document.querySelectorAll('.sr-mobile-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    closeMobileMenu();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===============================
   CHARACTER SELECTOR
================================ */
const characterData = {
  wynter: {
    name: 'WYNTER',
    class: 'Liminal Knight',
    weapon: 'Dual Sword',
    age: '23',
    height: 'Ra - City of the Sun',
    bio: 'Born as princess of the Ra royal family, Wynter’s parents were killed under mysterious circumstances when she was a child. A man known as the Count gained control over the empire, and forced a young Wynter to pray to the Solar Obelisk in order to increase its Light Energy output. This put a lot of strain on her and she begins to lose her Solar powers. She has gone rogue as an adult and actively opposes the Holy Ra Empire, and the abuse of Light Energy.',
    portrait: '/assets/solar-requiem/wynter-portrait.png',
    orb: '/assets/solar-requiem/dark-light-orb.svg'
  },
  saruna: {
    name: 'SARUNA',
    class: 'Light Sage',
    weapon: 'Staff',
    age: '42',
    height: 'Fleuret - Remote Village',
    bio: 'Founder and headmaster of the Duat Institute, which controversially introduced the study of Dark Energy in conjunction with Light Energy. Although she struggles with dark energy herself, she is hopeful that she can educate people on the importance of Light and Dark before imbalance comes to the world.',
    portrait: '/assets/solar-requiem/saruna-portrait.png',
    orb: '/assets/solar-requiem/light-orb.svg'
  },
  atum: {
    name: 'ATUM',
    class: 'Dark Engineer',
    weapon: 'Demon Gun',
    age: '56',
    height: 'Numeropolis - Information City',
    bio: 'One of the first individuals to begin to teach Dark Energy with the same rigor and discipline as Light Energy. After years of persecution, he and his acolytes of dark were embraced by many -but not all- of the students in the Holy Conservatory.',
    portrait: '/assets/solar-requiem/atum-portrait.png',
    orb: '/assets/solar-requiem/dark-orb.svg'
  }
};

const charButtons = document.querySelectorAll('.sr-char-select-btn');
const detailPortraitWrap = document.getElementById('sr-detail-portrait-wrap');

charButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.character;
    const data = characterData[key];
    if (!data) return;

    charButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    detailPortraitWrap.innerHTML = `<img src="${data.portrait}" alt="${data.name}">`;

    document.getElementById('sr-char-name').textContent = data.name;

    const classEl = document.getElementById('sr-char-class');
    classEl.innerHTML = `<img src="${data.orb}" alt="" class="sr-char-orb" id="sr-char-orb"> ${data.class}`;
    classEl.className = 'sr-char-class';

    document.getElementById('sr-char-weapon').textContent = data.weapon;
    document.getElementById('sr-char-age').textContent = data.age;
    document.getElementById('sr-char-height').textContent = data.height;
    document.getElementById('sr-char-bio').textContent = data.bio;
  });
});

/* ===============================
   GALLERY
================================ */
const galleryImages = [
  { src: '/assets/SR-Airship.png', alt: 'Airship', category: 'environments' },
  { src: '/assets/SR-SunInterior.png', alt: 'Sun Interior', category: 'environments' },
  { src: '/assets/SR-DomeHome2.png', alt: 'Dome Home', category: 'environments' },
  { src: '/assets/SR-overworld2.png', alt: 'Overworld', category: 'environments' },
  { src: '/assets/SR-Palace.png', alt: 'Palace', category: 'environments' },
  { src: '/assets/SR-Palace2.png', alt: 'Palace 2', category: 'environments' },
];

let currentGalleryIndex = 0;
let filteredImages = [...galleryImages];

const mainImg = document.getElementById('sr-gallery-main-img');
const thumbContainer = document.querySelector('.sr-gallery-thumbs');
const dotsContainer = document.getElementById('sr-gallery-dots');

filteredImages.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'sr-gallery-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Go to image ${i + 1}`);
  dot.addEventListener('click', () => {
    currentGalleryIndex = i;
    updateGallery();
  });
  dotsContainer.appendChild(dot);
});

function updateGallery() {
  if (!filteredImages.length) return;
  mainImg.src = filteredImages[currentGalleryIndex].src;
  mainImg.alt = filteredImages[currentGalleryIndex].alt;

  const thumbs = thumbContainer.querySelectorAll('.sr-gallery-thumb');
  thumbs.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === currentGalleryIndex);
  });

  const dots = dotsContainer.querySelectorAll('.sr-gallery-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentGalleryIndex);
  });
}

document.querySelectorAll('.sr-gallery-prev').forEach(btn => {
  btn.addEventListener('click', () => {
    currentGalleryIndex = (currentGalleryIndex - 1 + filteredImages.length) % filteredImages.length;
    updateGallery();
  });
});

document.querySelectorAll('.sr-gallery-next').forEach(btn => {
  btn.addEventListener('click', () => {
    currentGalleryIndex = (currentGalleryIndex + 1) % filteredImages.length;
    updateGallery();
  });
});

thumbContainer?.addEventListener('click', (e) => {
  const thumb = e.target.closest('.sr-gallery-thumb');
  if (!thumb) return;
  const index = Array.from(thumbContainer.querySelectorAll('.sr-gallery-thumb')).indexOf(thumb);
  if (index >= 0) {
    currentGalleryIndex = index;
    updateGallery();
  }
});


/* ===============================
   WAITLIST MODAL
================================ */
const waitlistModal = document.getElementById('sr-waitlist-modal');
const openModalBtn = document.getElementById('sr-open-waitlist-modal');
const closeModalBtn = document.getElementById('sr-close-waitlist-modal');

openModalBtn?.addEventListener('click', () => {
  waitlistModal.classList.add('open');
  document.body.style.overflow = 'hidden';
});

closeModalBtn?.addEventListener('click', () => {
  waitlistModal.classList.remove('open');
  document.body.style.overflow = '';
});

waitlistModal?.addEventListener('click', (e) => {
  if (e.target === waitlistModal) {
    waitlistModal.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ===============================
   WAITLIST FORMS
================================ */
function handleWaitlistSubmit(form) {
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = new FormData(form).get('email');
    if (!email) return;

    let msg = form.querySelector('.sr-waitlist-message');
    if (!msg) {
      msg = document.createElement('p');
      msg.className = 'sr-waitlist-message';
      form.appendChild(msg);
    }
    msg.textContent = 'Subscribing...';
    msg.className = 'sr-waitlist-message';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        msg.textContent = data.message;
        msg.classList.add('success');
        form.reset();
      } else {
        msg.textContent = data.error || 'Something went wrong';
        msg.classList.add('error');
      }
    } catch {
      msg.textContent = 'Network error. Please try again.';
      msg.classList.add('error');
    }
  });
}

handleWaitlistSubmit(document.getElementById('sr-waitlist-form'));
handleWaitlistSubmit(document.getElementById('sr-modal-waitlist-form'));
