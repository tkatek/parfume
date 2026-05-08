/* ============================================================
   LUMIÈRE — script.js
   Architecture:
   1. GSAP / ScrollTrigger Animation Module
   2. Custom Cursor Module
   3. Cart & UI State Module
   4. Filter / Collection Module
   5. Utility Functions
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   1. GSAP ANIMATION MODULE
   ───────────────────────────────────────────────────────────── */
const AnimationModule = (() => {

  function init() {
    gsap.registerPlugin(ScrollTrigger);

    initPageLoad();
    initScrollAnimations();
    initParallax();
    initHeroFloat();
    initCounters();
    initMarquee();
  }

  /* Hero entrance animation — runs once on load */
  function initPageLoad() {
    const tl = gsap.timeline({ delay: 0.2 });

    // Header slides in
    tl.from('.site-header', {
      y: -80,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out'
    });

    // Eyebrow fade
    tl.to('.hero-eyebrow', {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.3');

    // Headline line-by-line mask reveal
    tl.to('.hero-headline .reveal-line', {
      y: '0%',
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12
    }, '-=0.2');

    // Description + CTA
    tl.to(['.hero-desc', '.hero-cta'], {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.15
    }, '-=0.3');

    // Aside pills
    tl.to('.aside-pill', {
      opacity: 1,
      x: 0,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.15
    }, '-=0.4');

    // Stats
    tl.to('.aside-stats', {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.3');

    // Scroll indicator
    tl.from('.scroll-indicator', {
      opacity: 0,
      duration: 0.6
    }, '-=0.2');
  }

  /* ScrollTrigger-based reveal animations */
  function initScrollAnimations() {
    // ─── Product cards — batch stagger ───
    ScrollTrigger.batch('.product-card', {
      onEnter: batch => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.12
        });
      },
      start: 'top 88%',
      once: true
    });

    // ─── Section headers ───
    gsap.utils.toArray('.section-eyebrow, .section-title, .section-desc').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true
        },
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    // ─── Philosophy text column ───
    gsap.from('.philosophy-text-col > *', {
      scrollTrigger: {
        trigger: '.philosophy-section',
        start: 'top 80%',
        once: true
      },
      opacity: 0,
      y: 30,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.1
    });

    // ─── Pillars stagger ───
    gsap.from('.pillar', {
      scrollTrigger: {
        trigger: '.philosophy-pillars',
        start: 'top 85%',
        once: true
      },
      opacity: 0,
      x: -20,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.15
    });

    // ─── Collection cards ───
    ScrollTrigger.batch('.col-card', {
      onEnter: batch => {
        gsap.from(batch, {
          opacity: 0,
          y: 25,
          duration: 0.65,
          ease: 'power2.out',
          stagger: 0.08
        });
      },
      start: 'top 88%',
      once: true
    });

    // ─── About section images ───
    gsap.utils.toArray('.about-img-wrap').forEach((img, i) => {
      gsap.from(img, {
        scrollTrigger: {
          trigger: img,
          start: 'top 90%',
          once: true
        },
        opacity: 0,
        y: 40,
        duration: 0.9,
        delay: i * 0.15,
        ease: 'power3.out'
      });
    });

    // ─── Contact section ───
    gsap.from('.contact-text > *', {
      scrollTrigger: {
        trigger: '.contact-section',
        start: 'top 80%',
        once: true
      },
      opacity: 0,
      x: -30,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1
    });

    gsap.from('.form-field, .btn-submit', {
      scrollTrigger: {
        trigger: '.contact-form',
        start: 'top 85%',
        once: true
      },
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.08
    });

    // ─── Footer ───
    gsap.from('.footer-brand, .footer-col, .footer-newsletter', {
      scrollTrigger: {
        trigger: '.site-footer',
        start: 'top 85%',
        once: true
      },
      opacity: 0,
      y: 20,
      duration: 0.7,
      ease: 'power2.out',
      stagger: 0.1
    });
  }

  /* Heavy parallax on philosophy images */
  function initParallax() {
    gsap.utils.toArray('.parallax-img').forEach(img => {
      const speed = parseFloat(img.dataset.speed || '-0.1');
      gsap.to(img, {
        y: () => img.offsetHeight * speed * 2,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.philosophy-section'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });
  }

  /* Continuous floating animation on hero product */
  function initHeroFloat() {
    const floatEl = document.getElementById('heroFloat');
    if (!floatEl) return;

    gsap.to(floatEl, {
      y: -20,
      duration: 3.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    });

    // Subtle rotation too
    gsap.to(floatEl, {
      rotation: 1.5,
      duration: 5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  /* Animated counter for stats */
  function initCounters() {
    const counters = document.querySelectorAll('.stat-num');
    counters.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            innerText: target,
            duration: 1.8,
            ease: 'power2.out',
            snap: { innerText: 1 },
            onUpdate() {
              el.textContent = Math.round(parseFloat(el.textContent));
            }
          });
        }
      });
    });
  }

  /* Marquee — pure CSS but we can speed it up with gsap if needed */
  function initMarquee() {
    // Already handled via CSS animation; no JS needed
  }

  /* GSAP cart item stagger — called externally */
  function animateCartItems() {
    const items = document.querySelectorAll('.cart-item');
    gsap.to(items, {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.08,
      delay: 0.2
    });
  }

  /* GSAP filter animation — called from FilterModule */
  function animateFilter(hide, show) {
    const outTl = gsap.timeline();
    if (hide.length) {
      outTl.to(hide, {
        opacity: 0,
        scale: 0.92,
        duration: 0.35,
        ease: 'power2.in',
        stagger: 0.03,
        onComplete: () => hide.forEach(el => (el.style.display = 'none'))
      });
    }
    if (show.length) {
      outTl.call(() => {
        show.forEach(el => { el.style.display = ''; });
        gsap.fromTo(show, { opacity: 0, scale: 0.94, y: 10 }, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.05
        });
      });
    }
  }

  return { init, animateCartItems, animateFilter };
})();


/* ─────────────────────────────────────────────────────────────
   2. CUSTOM CURSOR MODULE
   ───────────────────────────────────────────────────────────── */
const CursorModule = (() => {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  const ringLag = 0.14;
  let raf;

  function init() {
    if (!dot || !ring) return;

    document.addEventListener('mousemove', onMove);
    setupHoverListeners();
    loop();
  }

  function onMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(dot, { x: mouseX, y: mouseY });
  }

  function loop() {
    ringX += (mouseX - ringX) * ringLag;
    ringY += (mouseY - ringY) * ringLag;
    gsap.set(ring, { x: ringX, y: ringY });
    raf = requestAnimationFrame(loop);
  }

  function setupHoverListeners() {
    const hoverEls = document.querySelectorAll(
      'a, button, .filter-btn, .product-card, .col-card, .pillar, .magnetic, input, textarea'
    );
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hovering'));
    });
  }

  return { init };
})();


/* ─────────────────────────────────────────────────────────────
   3. CART & UI STATE MODULE
   ───────────────────────────────────────────────────────────── */
const CartModule = (() => {
  let cartState = JSON.parse(localStorage.getItem('lumiere_cart') || '[]');

  // DOM refs
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooter  = document.getElementById('cartFooter');
  const cartBadge   = document.getElementById('cartBadge');
  const cartTotal   = document.getElementById('cartTotal');

  function init() {
    // Open / close
    document.getElementById('cartToggle')?.addEventListener('click', openCart);
    document.getElementById('cartClose')?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);

    // Add to cart buttons (event delegation)
    document.addEventListener('click', handleAddToCart);

    // Persist & render on load
    renderCart();
    updateBadge();

    // Header scroll effect
    initHeaderScroll();

    // Search overlay
    initSearchOverlay();

    // Contact form
    initContactForm();
  }

  /* ---------- Cart open / close ---------- */
  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    AnimationModule.animateCartItems();
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---------- Add to Cart ---------- */
  function handleAddToCart(e) {
    const btn = e.target.closest('.btn-add-cart');
    if (!btn) return;

    const name  = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    if (!name || isNaN(price)) return;

    addItem(name, price);
    showToast(`${name} added to cart ✦`);
  }

  function addItem(name, price) {
    const existing = cartState.find(i => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cartState.push({ name, price, qty: 1, id: Date.now() });
    }
    save();
    renderCart();
    updateBadge();
  }

  /* ---------- Render Cart ---------- */
  function renderCart() {
    // Clear existing items (keep empty msg)
    Array.from(cartItemsEl.querySelectorAll('.cart-item')).forEach(el => el.remove());

    if (cartState.length === 0) {
      cartEmptyEl.style.display = 'flex';
      cartFooter.style.display  = 'none';
      return;
    }

    cartEmptyEl.style.display = 'none';
    cartFooter.style.display  = 'block';

    let total = 0;

    cartState.forEach(item => {
      total += item.price * item.qty;
      const el = createItemEl(item);
      cartItemsEl.appendChild(el);
    });

    cartTotal.textContent = `$${total.toLocaleString()}`;
  }

  function createItemEl(item) {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.dataset.id = item.id;
    el.innerHTML = `
      <div class="cart-item-img"></div>
      <div>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">$${item.price}</p>
        <div class="qty-control">
          <button class="qty-btn minus" aria-label="Decrease">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn plus" aria-label="Increase">+</button>
        </div>
      </div>
      <button class="cart-item-remove" aria-label="Remove">✕</button>
    `;

    el.querySelector('.plus').addEventListener('click', () => { changeQty(item.id, 1); });
    el.querySelector('.minus').addEventListener('click', () => { changeQty(item.id, -1); });
    el.querySelector('.cart-item-remove').addEventListener('click', () => { removeItem(item.id); });

    return el;
  }

  function changeQty(id, delta) {
    const item = cartState.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeItem(id);
    else { save(); renderCart(); updateBadge(); }
  }

  function removeItem(id) {
    const idx = cartState.findIndex(i => i.id === id);
    if (idx === -1) return;

    // Animate out
    const el = cartItemsEl.querySelector(`[data-id="${id}"]`);
    if (el) {
      gsap.to(el, {
        opacity: 0, x: 30, height: 0, padding: 0,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          cartState.splice(idx, 1);
          save();
          renderCart();
          updateBadge();
        }
      });
    } else {
      cartState.splice(idx, 1);
      save();
      renderCart();
      updateBadge();
    }
  }

  function updateBadge() {
    const total = cartState.reduce((acc, i) => acc + i.qty, 0);
    cartBadge.textContent = total;
    if (total > 0) cartBadge.classList.add('visible');
    else           cartBadge.classList.remove('visible');
  }

  function save() {
    localStorage.setItem('lumiere_cart', JSON.stringify(cartState));
  }

  /* ---------- Header Scroll Effect ---------- */
  function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ---------- Search Overlay ---------- */
  function initSearchOverlay() {
    const overlay = document.getElementById('searchOverlay');
    const close   = document.getElementById('searchClose');
    const input   = document.getElementById('searchInput');
    const toggle  = document.getElementById('searchToggle');

    toggle?.addEventListener('click', () => {
      overlay.classList.add('open');
      setTimeout(() => input?.focus(), 400);
    });

    close?.addEventListener('click', () => overlay.classList.remove('open'));

    overlay?.addEventListener('keydown', e => {
      if (e.key === 'Escape') overlay.classList.remove('open');
    });
  }

  /* ---------- Contact Form ---------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    form?.addEventListener('submit', e => {
      e.preventDefault();
      showToast('Message sent — we\'ll be in touch ✦');
      form.reset();
    });
  }

  return { init, addItem };
})();


/* ─────────────────────────────────────────────────────────────
   4. FILTER / COLLECTION MODULE
   ───────────────────────────────────────────────────────────── */
const FilterModule = (() => {
  function init() {
    const btns  = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.col-card');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Active state
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Partition cards
        const hide = [];
        const show = [];
        cards.forEach(card => {
          const match = filter === 'all' || card.dataset.cat === filter;
          match ? show.push(card) : hide.push(card);
        });

        AnimationModule.animateFilter(hide, show);
      });
    });
  }

  return { init };
})();


/* ─────────────────────────────────────────────────────────────
   5. UTILITY FUNCTIONS
   ───────────────────────────────────────────────────────────── */
let toastTimeout;

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* Magnetic button effect */
function initMagneticButtons() {
  document.querySelectorAll('.magnetic').forEach(el => {
    const strength = 0.35;

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   BOOTSTRAP — run everything on DOMContentLoaded
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  AnimationModule.init();
  CursorModule.init();
  CartModule.init();
  FilterModule.init();
  initMagneticButtons();
});