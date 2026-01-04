import './style.css'

// Parallax effect for background
let ticking = false;

function updateParallax() {
  const scrolled = window.pageYOffset;
  const parallaxSpeed = 0.5;
  document.documentElement.style.setProperty('--parallax-y', `${scrolled * parallaxSpeed}px`);
  ticking = false;
}

function requestParallaxUpdate() {
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
}

window.addEventListener('scroll', requestParallaxUpdate);

// Hero Gallery functionality
const galleryImages = document.querySelector('.gallery-images');
const galleryArrowLeft = document.querySelector('.gallery-arrow-left');
const galleryArrowRight = document.querySelector('.gallery-arrow-right');
const galleryItems = document.querySelectorAll('.gallery-image-wrapper');

let currentGalleryIndex = 0;
const totalGalleryItems = galleryItems.length;

// Calculate how many items are visible at once
function getVisibleItems() {
  const containerWidth = document.querySelector('.gallery-scroll-container').offsetWidth;
  const itemWidth = galleryItems[0].offsetWidth;
  return Math.floor(containerWidth / itemWidth);
}

function updateGalleryPosition() {
  const itemWidth = galleryItems[0].offsetWidth;
  const offset = -currentGalleryIndex * itemWidth;
  galleryImages.style.transform = `translateX(${offset}px)`;
  
  // Update arrow states
  const visibleItems = getVisibleItems();
  const maxIndex = totalGalleryItems - visibleItems;
  
  if (currentGalleryIndex <= 0) {
    galleryArrowLeft.classList.add('disabled');
  } else {
    galleryArrowLeft.classList.remove('disabled');
  }
  
  if (currentGalleryIndex >= maxIndex) {
    galleryArrowRight.classList.add('disabled');
  } else {
    galleryArrowRight.classList.remove('disabled');
  }
}

galleryArrowLeft.addEventListener('click', () => {
  if (currentGalleryIndex > 0) {
    currentGalleryIndex--;
    updateGalleryPosition();
  }
});

galleryArrowRight.addEventListener('click', () => {
  const visibleItems = getVisibleItems();
  const maxIndex = totalGalleryItems - visibleItems;
  
  if (currentGalleryIndex < maxIndex) {
    currentGalleryIndex++;
    updateGalleryPosition();
  }
});

// Initialize gallery position
updateGalleryPosition();

// Update on window resize
window.addEventListener('resize', () => {
  updateGalleryPosition();
});

// Solar Requiem thumbnail switching
const solarMainImage = document.getElementById('solarMainImage');
const solarThumbnails = document.querySelectorAll('.solar-thumbnail');

solarThumbnails.forEach(thumbnail => {
  thumbnail.addEventListener('click', function() {
    // Remove active class from all thumbnails
    solarThumbnails.forEach(thumb => thumb.classList.remove('active'));
    
    // Add active class to clicked thumbnail
    this.classList.add('active');
    
    // Update main image
    const newImageSrc = this.getAttribute('data-main');
    solarMainImage.src = newImageSrc;
  });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});