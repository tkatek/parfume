/**
 * IKIRA Fine Fragrance — Main JavaScript
 * ════════════════════════════════════════
 * Architecture:
 *  1. CURSOR MODULE         — Custom cursor + magnetic buttons
 *  2. HEADER MODULE         — Scroll glass effect + mobile menu
 *  3. CART MODULE           — State management, drawer UI
 *  4. FILTER MODULE         — Collection grid filtering
 *  5. FORM MODULE           — Contact form interactions
 *  6. GSAP ANIMATIONS       — All scroll & entrance animations
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. CURSOR MODULE
═══════════════════════════════════════════════════════════ */
const CursorModule = (() => {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId;

  // Move dot instantly
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Animate ring with lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const targets = 'a, button, .magnetic, .filter-btn, .product-card, .coll-card, input, textarea';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(targets)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(targets)) document.body.classList.remove('cursor-hover');
  });
})();

/* ═══════════════════════════════════════════════════════════
   2. HEADER MODULE
═══════════════════════════════════════════════════════════ */
const HeaderModule = (() => {
  const header        = document.getElementById('header');
  const mobileBtn     = document.getElementById('mobileMenuBtn');
  const mobileNav     = document.getElementById('mobileNav');

  // Glassmorphic scroll effect
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Mobile menu toggle
  let menuOpen = false;
  mobileBtn?.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileNav.classList.toggle('open', menuOpen);
    const spans = mobileBtn.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.transform = '';
    }
  });

  // Close mobile nav on link click
  document.querySelectorAll('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileNav.classList.remove('open');
      const spans = mobileBtn.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.transform = '';
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   3. CART MODULE
═══════════════════════════════════════════════════════════ */
const CartModule = (() => {
  // ── State ──
  let cartItems = [];

  // ── DOM Refs ──
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartToggle  = document.getElementById('cartToggle');
  const cartClose   = document.getElementById('cartClose');
  const cartBadge   = document.getElementById('cartBadge');
  const cartCount   = document.getElementById('cartCount');
  const cartBody    = document.getElementById('cartBody');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmpty   = document.getElementById('cartEmpty');
  const cartFooter  = document.getElementById('cartFooter');
  const subtotalEl  = document.getElementById('cartSubtotal');

  // ── Open / Close ──
  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Stagger cart items in
    gsap.fromTo('.cart-item',
      { x: 30, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.08, duration: 0.45, ease: 'power3.out', delay: 0.25 }
    );
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  cartToggle?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

  // ── Add to Cart ──
  function addToCart(id, name, price) {
    const existing = cartItems.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cartItems.push({ id, name, price: parseFloat(price), qty: 1 });
    }
    renderCart();
    updateBadge();
    // Micro-animation on badge
    gsap.fromTo(cartBadge, { scale: 1.6 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
    openCart();
  }

  // ── Update Quantity ──
  function updateQty(id, delta) {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cartItems = cartItems.filter(i => i.id !== id);
    }
    renderCart();
    updateBadge();
  }

  // ── Remove Item ──
  function removeItem(id) {
    const el = cartItemsEl.querySelector(`[data-cart-id="${id}"]`);
    if (el) {
      gsap.to(el, {
        x: 40, opacity: 0, height: 0, marginBottom: 0, paddingBottom: 0,
        duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          cartItems = cartItems.filter(i => i.id !== id);
          renderCart();
          updateBadge();
        }
      });
    }
  }

  // ── Render Cart ──
  function renderCart() {
    if (cartItems.length === 0) {
      cartEmpty.style.display = 'flex';
      cartItemsEl.innerHTML = '';
      cartFooter.style.display = 'none';
      return;
    }

    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';

    let total = 0;
    cartItemsEl.innerHTML = cartItems.map(item => {
      total += item.price * item.qty;
      return `
        <li class="cart-item" data-cart-id="${item.id}">
          <div class="cart-item__img"></div>
          <div class="cart-item__info">
            <span class="cart-item__name">${item.name}</span>
            <span class="cart-item__price">$${item.price}</span>
            <div class="cart-item__qty">
              <button class="qty-btn" onclick="CartModule.updateQty('${item.id}', -1)">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="CartModule.updateQty('${item.id}', 1)">+</button>
            </div>
          </div>
          <button class="cart-item__remove" onclick="CartModule.removeItem('${item.id}')" aria-label="Remove">×</button>
        </li>
      `;
    }).join('');

    subtotalEl.textContent = `$${total.toFixed(2)}`;

    // Re-animate newly rendered items
    gsap.fromTo('.cart-item',
      { x: 20, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.07, duration: 0.4, ease: 'power3.out' }
    );
  }

  // ── Update Badge ──
  function updateBadge() {
    const total = cartItems.reduce((sum, i) => sum + i.qty, 0);
    cartBadge.textContent = total;
    cartCount.textContent = `(${total})`;
    cartBadge.classList.toggle('visible', total > 0);
  }

  // ── Delegate Cart Button Clicks ──
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-id][data-name][data-price]');
    if (btn) {
      const { id, name, price } = btn.dataset;
      addToCart(id, name, price);
    }
  });

  // Expose for inline handlers
  return { updateQty, removeItem };
})();

// Expose CartModule globally for inline onclick handlers
window.CartModule = CartModule;

/* ═══════════════════════════════════════════════════════════
   4. FILTER MODULE
═══════════════════════════════════════════════════════════ */
const FilterModule = (() => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.coll-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cat = card.dataset.category;
        const matches = filter === 'all' || cat === filter;

        if (matches) {
          // Show
          card.style.display = '';
          gsap.fromTo(card,
            { opacity: 0, y: 20, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out', delay: Math.random() * 0.12 }
          );
        } else {
          // Hide with animation
          gsap.to(card, {
            opacity: 0, scale: 0.88,
            duration: 0.28, ease: 'power2.in',
            onComplete: () => { card.style.display = 'none'; }
          });
        }
      });
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   5. FORM MODULE
═══════════════════════════════════════════════════════════ */
const FormModule = (() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.btn--submit');
    const text = btn.querySelector('.btn-text');

    // Success animation
    gsap.timeline()
      .to(btn, { scale: 0.96, duration: 0.1 })
      .to(btn, { scale: 1, duration: 0.3, ease: 'back.out(3)' });

    const original = text.textContent;
    text.textContent = 'Sent ✓';
    btn.style.background = 'var(--clr-sage)';

    setTimeout(() => {
      text.textContent = original;
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
})();

/* ═══════════════════════════════════════════════════════════
   6. GSAP ANIMATIONS MODULE
═══════════════════════════════════════════════════════════ */
const AnimationModule = (() => {
  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  /* ── Helper ── */
  const ease = 'power3.out';

  /* ── A) Hero Entrance ── */
  function initHeroAnimations() {
    const tl = gsap.timeline({ delay: 0.2 });

    // Eyebrow
    tl.to('.hero__eyebrow', {
      opacity: 1, y: 0, duration: 0.8, ease
    });

    // Title lines — staggered mask reveal
    tl.to('.hero__title-line', {
      opacity: 1, y: 0,
      duration: 0.9,
      stagger: 0.12,
      ease
    }, '-=0.5');

    // Description
    tl.to('.hero__desc', {
      opacity: 1, y: 0, duration: 0.7, ease
    }, '-=0.5');

    // CTA
    tl.to('.hero__cta', {
      opacity: 1, y: 0, duration: 0.6, ease
    }, '-=0.4');

    // Visual
    tl.fromTo('.hero__floating-img--main',
      { opacity: 0, x: 40, scale: 0.96 },
      { opacity: 1, x: 0, scale: 1, duration: 1.1, ease },
      '-=0.8'
    );

    tl.fromTo('.hero__floating-img--accent',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease },
      '-=0.5'
    );

    tl.fromTo('.hero__scent-badge',
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.6, ease },
      '-=0.4'
    );
  }

  /* ── B) Top Sales — ScrollTrigger batch ── */
  function initTopSalesAnimations() {
    ScrollTrigger.batch('.product-card', {
      onEnter: (elements) => {
        gsap.fromTo(elements, 
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease }
        );
      },
      start: 'top 85%',
      once: true
    });
  }

  /* ── C) Philosophy — Parallax ── */
  function initPhilosophyAnimations() {
    // Section title
    gsap.from('.philosophy__title', {
      opacity: 0, y: 50,
      scrollTrigger: {
        trigger: '.philosophy',
        start: 'top 75%',
        once: true
      },
      duration: 0.9, ease
    });

    gsap.from('.philosophy__body', {
      opacity: 0, y: 30,
      scrollTrigger: {
        trigger: '.philosophy',
        start: 'top 70%',
        once: true
      },
      duration: 0.8, stagger: 0.15, ease, delay: 0.2
    });

    // Parallax on large image
    gsap.to('.parallax-img', {
      y: -80,
      ease: 'none',
      scrollTrigger: {
        trigger: '.philosophy__img-col',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });

    // Fast parallax on small image
    gsap.to('.parallax-img-fast', {
      y: -130,
      ease: 'none',
      scrollTrigger: {
        trigger: '.philosophy__img-col',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
      }
    });

    // Big background text
    gsap.fromTo('.philosophy__big-text',
      { x: 100, opacity: 0 },
      {
        x: 0, opacity: 1,
        scrollTrigger: {
          trigger: '.philosophy',
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 2
        }
      }
    );
  }

  /* ── D) Collection grid entrance ── */
  function initCollectionAnimations() {
    ScrollTrigger.batch('.coll-card', {
      onEnter: (elements) => {
        gsap.fromTo(elements,
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.07, ease }
        );
      },
      start: 'top 88%',
      once: true
    });

    // Filter bar slide in
    gsap.from('.filter-bar', {
      opacity: 0, y: 20,
      scrollTrigger: {
        trigger: '.collection',
        start: 'top 80%',
        once: true
      },
      duration: 0.7, ease
    });
  }

  /* ── E) About section — split scroll ── */
  function initAboutAnimations() {
    gsap.from('.about__sticky-col', {
      opacity: 0, x: -40,
      scrollTrigger: {
        trigger: '.about',
        start: 'top 75%',
        once: true
      },
      duration: 0.9, ease
    });

    gsap.from('.about__scroll-img', {
      opacity: 0, y: 50,
      stagger: 0.15,
      scrollTrigger: {
        trigger: '.about__scroll-col',
        start: 'top 80%',
        once: true
      },
      duration: 0.8, ease
    });

    gsap.from('.about__stat', {
      opacity: 0, y: 30, scale: 0.95,
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.about__stat-row',
        start: 'top 85%',
        once: true
      },
      duration: 0.6, ease
    });

    // Number count-up animation
    const stats = document.querySelectorAll('.about__stat-num');
    stats.forEach(stat => {
      const target = stat.textContent;
      const numericTarget = parseFloat(target.replace(/[^0-9.]/g, ''));
      const suffix = target.replace(/[0-9.]/g, '');

      ScrollTrigger.create({
        trigger: stat,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo({ val: 0 },
            { val: numericTarget,
              duration: 1.5,
              ease: 'power2.out',
              onUpdate: function() {
                stat.textContent = (Math.round(this.targets()[0].val)) + suffix;
              }
            }
          );
        }
      });
    });
  }

  /* ── F) Contact section ── */
  function initContactAnimations() {
    gsap.from('.contact__title, .contact__body', {
      opacity: 0, y: 40,
      stagger: 0.15,
      scrollTrigger: {
        trigger: '.contact',
        start: 'top 78%',
        once: true
      },
      duration: 0.8, ease
    });

    gsap.from('.form-field', {
      opacity: 0, y: 20,
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.contact__form',
        start: 'top 80%',
        once: true
      },
      duration: 0.6, ease
    });

    gsap.from('.contact__info-item', {
      opacity: 0, x: -20,
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.contact__info',
        start: 'top 82%',
        once: true
      },
      duration: 0.6, ease
    });
  }

  /* ── G) Section headers ── */
  function initSectionHeaders() {
    gsap.utils.toArray('.section-header').forEach(header => {
      const label = header.querySelector('.section-label');
      const title = header.querySelector('.section-title');
      const sub   = header.querySelector('.section-sub');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 82%',
          once: true
        }
      });

      if (label) tl.from(label, { opacity: 0, y: 16, duration: 0.5, ease });
      if (title) tl.from(title, { opacity: 0, y: 28, duration: 0.75, ease }, '-=0.3');
      if (sub)   tl.from(sub,   { opacity: 0, y: 20, duration: 0.6, ease }, '-=0.4');
    });
  }

  /* ── H) Magnetic button effect ── */
  function initMagnetic() {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx   = rect.left + rect.width / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) * 0.32;
        const dy   = (e.clientY - cy) * 0.32;
        gsap.to(el, { x: dx, y: dy, duration: 0.35, ease: 'power2.out' });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ── I) Footer reveal ── */
  function initFooterAnimations() {
    gsap.from('.footer__brand, .footer__nav-col, .footer__newsletter', {
      opacity: 0, y: 30,
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%',
        once: true
      },
      duration: 0.7, ease
    });
  }

  /* ── J) Horizontal marquee for hero (optional ambient) ── */
  function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      position: fixed; top: 0; left: 0; height: 2px; z-index: 9999;
      background: linear-gradient(90deg, #C8926A, #E8B896);
      width: 0%; transform-origin: left;
      transition: width 0.1s linear;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── INIT ALL ── */
  function init() {
    initHeroAnimations();
    initTopSalesAnimations();
    initPhilosophyAnimations();
    initCollectionAnimations();
    initAboutAnimations();
    initContactAnimations();
    initSectionHeaders();
    initMagnetic();
    initFooterAnimations();
    initScrollProgress();
  }

  // Wait for DOM + slight delay for fonts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ═══════════════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLLING
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    gsap.to(window, {
      duration: 1.1,
      scrollTo: { y: target, offsetY: 76 },
      ease: 'power3.inOut'
    });
  });
});

/* ═══════════════════════════════════════════════════════════
   GSAP SCROLL PLUGINS (ScrollTo polyfill)
   — Gracefully degrades if plugin not loaded
═══════════════════════════════════════════════════════════ */
if (typeof gsap !== 'undefined' && !gsap.plugins?.scrollTo) {
  // Fallback smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}