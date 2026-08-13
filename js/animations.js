/* ==========================================================================
   INORA GLOBAL EXIM - High-Performance Animation Engine (Optimized for 60FPS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    return;
  }

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

    // Hero Section Reveal
    gsap.from('.hero-badge, .hero-title, .hero-subheadline, .hero-description, .hero-actions', {
      opacity: 0,
      y: 20,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power2.out'
    });

    // Trust Bar Items Stagger Reveal
    gsap.from('.trust-item', {
      scrollTrigger: {
        trigger: '.trust-bar',
        start: 'top 90%',
        once: true
      },
      opacity: 0,
      y: 15,
      stagger: 0.08,
      duration: 0.6,
      ease: 'power2.out'
    });

    // Section Titles Fade Up
    gsap.utils.toArray('.section-tag, .section-title, .section-desc').forEach(element => {
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
    });

    // Product Cards Stagger Reveal
    gsap.from('.product-card', {
      scrollTrigger: {
        trigger: '.products-grid',
        start: 'top 85%',
        once: true
      },
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power2.out'
    });

    // Export Process Timeline Steps Sequential Reveal
    gsap.utils.toArray('.timeline-item').forEach((item, index) => {
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
    });

    // Global Markets Chips Reveal
    gsap.from('.market-chip', {
      scrollTrigger: {
        trigger: '.markets-grid',
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
