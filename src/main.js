import './style.css'

// Parallax background effect
function initParallax() {
  let ticking = false;
  
  function updateParallax() {
    const scrollY = window.scrollY;
    // Parallax speed factor (0.2 means background moves at 20% speed - much slower)
    // Adjust this value to change parallax intensity (lower = slower)
    const parallaxSpeed = 0.2;
    const translateY = scrollY * parallaxSpeed;
    
    // Update CSS custom property on document root
    document.documentElement.style.setProperty('--parallax-y', `${translateY}px`);
    
    ticking = false;
  }
  
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Initial call
  updateParallax();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initParallax);
} else {
  initParallax();
}

// Gallery horizontal scrolling
function initGallery() {
  const galleryContainers = document.querySelectorAll('.gallery-container');
  
  galleryContainers.forEach(container => {
    const scrollContainer = container.querySelector('.gallery-scroll');
    const itemsContainer = container.querySelector('.gallery-items');
    const leftArrow = container.querySelector('.gallery-arrow-left');
    const rightArrow = container.querySelector('.gallery-arrow-right');
    const items = container.querySelectorAll('.gallery-item');
    
    let scrollPosition = 0;
    const gap = 16;
    
    function getScrollValues() {
      const itemWidth = items[0]?.offsetWidth || 400;
      const scrollAmount = itemWidth + gap;
      const maxScroll = Math.max(0, (items.length - 1) * scrollAmount);
      return { itemWidth, scrollAmount, maxScroll };
    }
    
    function updateArrows() {
      const { maxScroll } = getScrollValues();
      
      if (scrollPosition <= 0) {
        leftArrow.classList.remove('visible');
      } else {
        leftArrow.classList.add('visible');
      }
      
      if (scrollPosition >= maxScroll) {
        rightArrow.style.opacity = '0.5';
        rightArrow.style.pointerEvents = 'none';
      } else {
        rightArrow.style.opacity = '0.88';
        rightArrow.style.pointerEvents = 'auto';
      }
      
      // Mark items under arrows as unclickable
      updateItemsUnderArrows();
    }
    
    function updateItemsUnderArrows() {
      const arrowWidth = 60;
      const scrollRect = scrollContainer.getBoundingClientRect();
      const scrollLeft = scrollRect.left;
      const scrollRight = scrollRect.right;
      
      items.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const itemLeft = itemRect.left;
        const itemRight = itemRect.right;
        
        // Check if item is under left arrow area
        const underLeftArrow = itemLeft < scrollLeft + arrowWidth && itemRight > scrollLeft;
        // Check if item is under right arrow area
        const underRightArrow = itemRight > scrollRight - arrowWidth && itemLeft < scrollRight;
        
        if (underLeftArrow || underRightArrow) {
          item.classList.add('under-arrow');
        } else {
          item.classList.remove('under-arrow');
        }
      });
    }
    
    function scroll(direction) {
      const { scrollAmount, maxScroll } = getScrollValues();
      
      if (direction === 'left' && scrollPosition > 0) {
        scrollPosition = Math.max(0, scrollPosition - scrollAmount);
      } else if (direction === 'right' && scrollPosition < maxScroll) {
        scrollPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
      }
      
      itemsContainer.style.transform = `translateX(-${scrollPosition}px)`;
      // Use requestAnimationFrame to ensure DOM updates before checking positions
      requestAnimationFrame(() => {
        updateArrows();
      });
    }
    
    leftArrow.addEventListener('click', () => scroll('left'));
    rightArrow.addEventListener('click', () => scroll('right'));
    
    // Update arrows on window resize
    function handleResize() {
      const { maxScroll } = getScrollValues();
      scrollPosition = Math.min(scrollPosition, maxScroll);
      itemsContainer.style.transform = `translateX(-${scrollPosition}px)`;
      updateArrows();
    }
    
    window.addEventListener('resize', handleResize);
    
    // Recalculate after images load
    const images = container.querySelectorAll('.gallery-image');
    let loadedImages = 0;
    images.forEach(img => {
      if (img.complete) {
        loadedImages++;
      } else {
        img.addEventListener('load', () => {
          loadedImages++;
          if (loadedImages === images.length) {
            handleResize();
          }
        });
      }
    });
    
    if (loadedImages === images.length) {
      handleResize();
    }
    
    // Initial arrow state
    // Wait for layout to calculate positions
    requestAnimationFrame(() => {
      updateArrows();
    });
  });
}

// Fullscreen image modal
function initImageModal() {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const galleryImages = document.querySelectorAll('.gallery-image');
  const solarMainImage = document.getElementById('solarMainImage');
  
  galleryImages.forEach(img => {
    img.addEventListener('click', () => {
      modalImage.src = img.src;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  
  // Add click handler for Solar Requiem main image
  if (solarMainImage) {
    solarMainImage.addEventListener('click', () => {
      modalImage.src = solarMainImage.src;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
  
  modal.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// Solar Requiem thumbnail interactions
function initSolarRequiem() {
  const mainImage = document.getElementById('solarMainImage');
  const thumbnails = document.querySelectorAll('.solar-thumbnail');
  
  if (!mainImage || thumbnails.length === 0) return;
  
  // Set initial active thumbnail (first one with active class or first one)
  const initialActive = document.querySelector('.solar-thumbnail.active') || thumbnails[0];
  if (initialActive) {
    const initialSrc = initialActive.getAttribute('data-main');
    if (initialSrc && mainImage.src !== initialSrc) {
      mainImage.src = initialSrc;
    }
    if (!initialActive.classList.contains('active')) {
      initialActive.classList.add('active');
    }
  }
  
  thumbnails.forEach(thumbnail => {
    // Hover to change main image
    thumbnail.addEventListener('mouseenter', () => {
      const mainImageSrc = thumbnail.getAttribute('data-main');
      if (mainImageSrc) {
        mainImage.src = mainImageSrc;
        // Update active state
        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
      }
    });
    
    // Click to set as active and update main image
    thumbnail.addEventListener('click', () => {
      const mainImageSrc = thumbnail.getAttribute('data-main');
      if (mainImageSrc) {
        mainImage.src = mainImageSrc;
        thumbnails.forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
      }
    });
  });
}

// Initialize gallery features
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initGallery();
    initImageModal();
    initSolarRequiem();
  });
} else {
  initGallery();
  initImageModal();
  initSolarRequiem();
}
