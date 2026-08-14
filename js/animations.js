/* ==========================================================================
   INORA GLOBAL EXIM - High-Performance Immersive Animation Engine (60FPS)
   Includes: Preloader Curtain, Scroll Progress Bar, Ambient Spotlight Glow,
             Motion Text Effect, Lenis Smooth Scroll, GSAP Stagger Reveals
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Cinematic Preloader Curtain
  initPreloaderController();

  // 2. Initialize Scroll Progress Indicator
  initScrollProgressBar();

  // 3. Initialize Ambient Cursor Glow Spotlight
  initCursorSpotlight();

  // 4. Initialize About Air & Ocean Logistics Auto-Slider
  initAboutLogisticsSlider();

  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

  // Motion Text Effect Splitter & Renderer
  initMotionTextEffect();

  // Official GSAP + Lenis Integration Loop (Single Unified Ticker)
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false
    });

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // GSAP Animations setup if available
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Animate split Motion Text Effect words in Hero section
    const heroWords = document.querySelectorAll('.hero-title .motion-word, .hero-subheadline .motion-word');
    if (heroWords.length > 0) {
      gsap.fromTo(heroWords, 
        { opacity: 0, y: 28, filter: 'blur(6px)', rotateX: -25 },
        { opacity: 1, y: 0, filter: 'blur(0px)', rotateX: 0, duration: 0.75, stagger: 0.05, ease: 'power3.out', delay: 0.5 }
      );
    }

    // Hero Section Actions & Description Reveal
    const heroElements = document.querySelectorAll('.hero-badge, .hero-description, .hero-actions');
    if (heroElements.length > 0) {
      gsap.from(heroElements, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.7
      });
    }

    // Trust Bar Items Stagger Reveal
    const trustBar = document.querySelector('.trust-bar');
    const trustItems = document.querySelectorAll('.trust-item');
    if (trustBar && trustItems.length > 0) {
      gsap.from(trustItems, {
        scrollTrigger: {
          trigger: trustBar,
          start: 'top 90%',
          once: true
        },
        opacity: 0,
        y: 15,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out'
      });
    }

    // Section Titles Fade Up
    const sectionElements = gsap.utils.toArray('.section-tag, .section-title, .section-desc');
    if (sectionElements.length > 0) {
      sectionElements.forEach(element => {
        if (element) {
          gsap.from(element, {
            scrollTrigger: {
              trigger: element,
              start: 'top 90%',
              once: true
            },
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power2.out'
          });
        }
      });
    }

    // Product Cards Stagger Reveal
    initProductCardsAnimation();

    // Export Process Timeline Steps Sequential Reveal
    const timelineItems = gsap.utils.toArray('.timeline-item');
    if (timelineItems.length > 0) {
      timelineItems.forEach((item, index) => {
        if (item) {
          gsap.from(item, {
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              once: true
            },
            opacity: 0,
            x: index % 2 === 0 ? -30 : 30,
            duration: 0.7,
            ease: 'power2.out'
          });
        }
      });
    }

    // Global Markets Chips Reveal
    const marketsGrid = document.querySelector('.markets-grid');
    const marketChips = document.querySelectorAll('.market-chip');
    if (marketsGrid && marketChips.length > 0) {
      gsap.from(marketChips, {
        scrollTrigger: {
          trigger: marketsGrid,
          start: 'top 85%',
          once: true
        },
        opacity: 0,
        scale: 0.95,
        stagger: 0.08,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }

  // Lightweight Card Hover Effect
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    let ticking = false;

    card.addEventListener('mousemove', (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -3;
          const rotateY = ((x - centerX) / centerX) * 3;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
          ticking = false;
        });
        ticking = true;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });
});

/**
 * Re-triggerable GSAP reveal for Product Cards
 */
function initProductCardsAnimation() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  const productsGrid = document.querySelector('.products-grid');
  const productCards = document.querySelectorAll('.product-card');
  if (productsGrid && productCards.length > 0) {
    gsap.from(productCards, {
      scrollTrigger: {
        trigger: productsGrid,
        start: 'top 85%',
        once: true
      },
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power2.out'
    });
  }
}
window.initProductCardsAnimation = initProductCardsAnimation;

/**
 * Global Trade Cargo Preloader Controller
 */
function initPreloaderController() {
  const preloader = document.getElementById('preloader') || document.getElementById('inora-preloader');
  if (!preloader) return;

  // Run ONLY ONCE on site entrance per browser session
  if (sessionStorage.getItem('inora_preloader_seen') === 'true') {
    preloader.classList.add('preloader-hidden');
    preloader.classList.add('loaded');
    return;
  }
  sessionStorage.setItem('inora_preloader_seen', 'true');

  const statuses = [
    "Securing global freight lines...",
    "Verifying Indian agricultural manifests...",
    "Optimizing sea & air cargo routes...",
    "Finalizing export dispatch..."
  ];

  let statusIndex = 0;
  const statusElement = document.getElementById('status-text');

  if (statusElement) {
    setInterval(() => {
      statusIndex = (statusIndex + 1) % statuses.length;
      statusElement.textContent = statuses[statusIndex];
    }, 700);
  }

  const dismissPreloader = () => {
    preloader.classList.add('preloader-hidden');
    preloader.classList.add('loaded');
  };

  window.addEventListener('load', () => {
    setTimeout(dismissPreloader, 800);
  });

  // Safety fallback timer
  setTimeout(dismissPreloader, 2200);
}

/**
 * About Section Air & Ocean Freight Logistics Visual Auto-Slider
 */
function initAboutLogisticsSlider() {
  const slider = document.getElementById('about-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.about-slide');
  const title = document.getElementById('logistics-slide-title');
  const sub = document.getElementById('logistics-slide-sub');
  if (slides.length < 2) return;

  let currentIndex = 0;
  const slideData = [
    {
      title: '<i class="fas fa-plane"></i> AIR FREIGHT LOGISTICS',
      sub: 'Cargo Aircraft Express Freight & Rapid Dispatch'
    },
    {
      title: '<i class="fas fa-ship"></i> OCEAN FREIGHT LOGISTICS',
      sub: 'Full Container Load (FCL) Vessel Cargo Coordination'
    }
  ];

  setInterval(() => {
    slides[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add('active');

    if (title && sub && slideData[currentIndex]) {
      title.innerHTML = slideData[currentIndex].title;
      sub.textContent = slideData[currentIndex].sub;
    }
  }, 3500);
}

/**
 * Scroll Progress Indicator
 */
function initScrollProgressBar() {
  const bar = document.getElementById('scroll-progress-bar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = scrollPercent + '%';
  });
}

/**
 * Ambient Cursor Spotlight Glow
 */
function initCursorSpotlight() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;
  let isMoving = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(animateSpotlight);
    }
  });

  function animateSpotlight() {
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;

    glow.style.left = currentX + 'px';
    glow.style.top = currentY + 'px';

    if (Math.abs(mouseX - currentX) > 0.1 || Math.abs(mouseY - currentY) > 0.1) {
      requestAnimationFrame(animateSpotlight);
    } else {
      isMoving = false;
    }
  }
}

/**
 * Motion Text Effect Helper
 */
function initMotionTextEffect() {
  const targets = document.querySelectorAll('.hero-title, .hero-subheadline, .page-hero-title');
  targets.forEach(target => {
    if (target.getAttribute('data-motion-split') === 'true') return;
    target.setAttribute('data-motion-split', 'true');

    splitElementWords(target);
  });
}

function splitElementWords(element) {
  const childNodes = Array.from(element.childNodes);
  element.innerHTML = '';

  childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const words = text.split(/\s+/).filter(Boolean);
      words.forEach(word => {
        const wrap = document.createElement('span');
        wrap.className = 'motion-word-wrap';
        wrap.innerHTML = `<span class="motion-word">${word}</span>`;
        element.appendChild(wrap);
        element.appendChild(document.createTextNode(' '));
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = node.cloneNode(false);
      const text = node.textContent;
      const words = text.split(/\s+/).filter(Boolean);
      words.forEach(word => {
        const wrap = document.createElement('span');
        wrap.className = 'motion-word-wrap';
        wrap.innerHTML = `<span class="motion-word">${word}</span>`;
        clone.appendChild(wrap);
        clone.appendChild(document.createTextNode(' '));
      });
      element.appendChild(clone);
      element.appendChild(document.createTextNode(' '));
    }
  });
}

// 4. Clean Card Hover Interactions (3D tilt removed per specification)
