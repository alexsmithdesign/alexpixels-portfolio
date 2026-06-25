document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile-menu');
  const mobileClose = document.querySelector('.nav__mobile-close');
  const mobileLinks = mobileMenu?.querySelectorAll('a');
  const disclaimer = document.querySelector('.disclaimer');
  const disclaimerClose = document.querySelector('.disclaimer__close');

  function closeMobileMenu() {
    hamburger?.classList.remove('active');
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
  }

  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 50);
  });

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu?.classList.toggle('open');
    document.body.style.overflow = mobileMenu?.classList.contains('open') ? 'hidden' : '';
  });

  mobileClose?.addEventListener('click', closeMobileMenu);

  mobileLinks?.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  disclaimerClose?.addEventListener('click', () => {
    disclaimer?.classList.add('hidden');
    document.documentElement.style.setProperty('--disclaimer-height', '0px');
  });
});
