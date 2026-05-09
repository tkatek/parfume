/* ============================================================
   LUMIÈRE — script.js  (Final Production Version)

   Module Architecture:
   ─────────────────────────────────────────────────────────
   1. AnimationModule  — all GSAP / ScrollTrigger logic
   2. CursorModule     — custom cursor + hover states
   3. BurgerModule     — mobile menu open / close
   4. CartModule       — cart drawer, state, localStorage
   5. FilterModule     — collection category filter
   6. initMagnetic()   — magnetic button micro-interaction
   7. Bootstrap        — DOMContentLoaded wiring
   ============================================================ */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. ANIMATION MODULE
   ═══════════════════════════════════════════════════════════ */
const AnimationModule = (() => {

  function init() {
    gsap.registerPlugin(ScrollTrigger);

    initPageLoad();
    initScrollAnimations();
    initParallax();
    initHeroFloat();
    initCounters();
  }

  /* ── Hero entrance — runs once on page load ── */
  function initPageLoad() {
    const tl = gsap.timeline({ delay: 0.15 });

    // Header drop-in
    tl.from('.site-header', {
      y: -80, opacity: 0,
      duration: 0.9, ease: 'power3.out'
    });

    // Eyebrow fade-in
    tl.to('.hero-eyebrow', {
      opacity: 1, duration: 0.6, ease: 'power2.out'
    }, '-=0.3');

    // Headline lines unmask (translateY 100% → 0)
    tl.to('.hero-headline .reveal-line', {
      y: '0%',
      duration: 0.9, ease: 'power3.out',
      stagger: 0.12
    }, '-=0.2');

    // Description paragraph fades in
    tl.to('.hero-desc', {
      opacity: 1, duration: 0.7, ease: 'power2.out'
    }, '-=0.4');

    // CTA buttons
    tl.to('.hero-cta', {
      opacity: 1, duration: 0.6, ease: 'power2.out'
    }, '-=0.35');

    // Aside pills slide in from right (only when rendered)
    tl.to('.aside-pill', {
      opacity: 1, x: 0,
      duration: 0.7, ease: 'power2.out',
      stagger: 0.14
    }, '-=0.4');

    // Stats
    tl.to('.aside-stats', {
      opacity: 1, duration: 0.6, ease: 'power2.out'
    }, '-=0.3');

    // Scroll indicator
    tl.from('.scroll-indicator', {
      opacity: 0, duration: 0.5
    }, '-=0.2');
  }

  /* ── ScrollTrigger reveal animations ── */
  function initScrollAnimations() {

    // Product cards — batch stagger (fade + rise)
    ScrollTrigger.batch('.product-card', {
      onEnter: batch => {
        gsap.to(batch, {
          opacity: 1, y: 0,
          duration: 0.75, ease: 'power3.out',
          stagger: 0.11
        });
      },
      start: 'top 88%',
      once: true
    });

    // Generic section headers
    gsap.utils.toArray(
      '.section-eyebrow, .section-title, .section-desc'
    ).forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        opacity: 0, y: 22,
        duration: 0.8, ease: 'power3.out'
      });
    });

    // Philosophy text column children
    gsap.from('.philosophy-text-col > *', {
      scrollTrigger: {
        trigger: '.philosophy-section',
        start: 'top 78%', once: true
      },
      opacity: 0, y: 28,
      duration: 0.9, ease: 'power3.out',
      stagger: 0.09
    });

    // Philosophy pillars — slide from left
    gsap.from('.pillar', {
      scrollTrigger: {
        trigger: '.philosophy-pillars',
        start: 'top 86%', once: true
      },
      opacity: 0, x: -22,
      duration: 0.7, ease: 'power2.out',
      stagger: 0.14
    });

    // Collection cards
    ScrollTrigger.batch('.col-card', {
      onEnter: batch => {
        gsap.from(batch, {
          opacity: 0, y: 22,
          duration: 0.65, ease: 'power2.out',
          stagger: 0.07
        });
      },
      start: 'top 88%',
      once: true
    });

    // About images
    gsap.utils.toArray('.about-img-wrap').forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        opacity: 0, y: 36,
        duration: 0.9, delay: i * 0.14,
        ease: 'power3.out'
      });
    });

    // Why Us text
    gsap.from('.whyus-text-block > *', {
      scrollTrigger: {
        trigger: '.whyus-section',
        start: 'top 80%', once: true
      },
      opacity: 0, y: 24,
      duration: 0.8, ease: 'power3.out',
      stagger: 0.1
    });

    // Why Us stats
    gsap.from('.whyus-stat', {
      scrollTrigger: {
        trigger: '.whyus-stats-col',
        start: 'top 85%', once: true
      },
      opacity: 0, x: 20,
      duration: 0.7, ease: 'power2.out',
      stagger: 0.14
    });

    // Contact text
    gsap.from('.contact-text > *', {
      scrollTrigger: {
        trigger: '.contact-section',
        start: 'top 80%', once: true
      },
      opacity: 0, x: -28,
      duration: 0.8, ease: 'power3.out',
      stagger: 0.1
    });

    // Contact form fields
    gsap.from('.form-field, .btn-submit', {
      scrollTrigger: {
        trigger: '.contact-form',
        start: 'top 86%', once: true
      },
      opacity: 0, y: 18,
      duration: 0.6, ease: 'power2.out',
      stagger: 0.08
    });

    // Footer
    gsap.from('.footer-brand, .footer-col, .footer-newsletter', {
      scrollTrigger: {
        trigger: '.site-footer',
        start: 'top 86%', once: true
      },
      opacity: 0, y: 18,
      duration: 0.7, ease: 'power2.out',
      stagger: 0.1
    });
  }

  /* ── Parallax — philosophy + why-us image columns ── */
  function initParallax() {
    gsap.utils.toArray('.parallax-img').forEach(el => {
      const speed = parseFloat(el.dataset.speed ?? '-0.1');
      gsap.to(el, {
        y: () => el.offsetHeight * speed * 2,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') ?? el,
          start: 'top bottom',
          end:   'bottom top',
          scrub: 1.8
        }
      });
    });
  }

  /* ── Continuous floating animation on hero product ── */
  function initHeroFloat() {
    const el = document.getElementById('heroFloat');
    if (!el) return;

    // Vertical float
    gsap.to(el, {
      y: -20,
      duration: 3.5, ease: 'power1.inOut',
      yoyo: true, repeat: -1
    });

    // Subtle rotation yoyo
    gsap.to(el, {
      rotation: 1.5,
      duration: 5, ease: 'sine.inOut',
      yoyo: true, repeat: -1
    });
  }

  /* ── Animated counters (.stat-num and .wstat-num) ── */
  function initCounters() {
    document.querySelectorAll('.stat-num, .wstat-num').forEach(el => {
      const target = parseInt(el.dataset.target ?? '0', 10);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            { val: 0 },
            { val: target,
              duration: 1.8, ease: 'power2.out',
              onUpdate() { el.textContent = Math.round(this.targets()[0].val); }
            }
          );
        }
      });
    });
  }

  /* ── Cart items stagger (called after drawer opens) ── */
  function animateCartItems() {
    gsap.to('.cart-item', {
      opacity: 1, x: 0,
      duration: 0.5, ease: 'power2.out',
      stagger: 0.08, delay: 0.2
    });
  }

  /* ── Filter transition (called by FilterModule) ── */
  function animateFilter(hide, show) {
    const tl = gsap.timeline();

    if (hide.length) {
      tl.to(hide, {
        opacity: 0, scale: 0.93,
        duration: 0.32, ease: 'power2.in',
        stagger: 0.025,
        onComplete: () => hide.forEach(el => (el.style.display = 'none'))
      });
    }

    tl.call(() => {
      show.forEach(el => (el.style.display = ''));
      gsap.fromTo(show,
        { opacity: 0, scale: 0.95, y: 10 },
        { opacity: 1, scale: 1, y: 0,
          duration: 0.42, ease: 'power2.out',
          stagger: 0.045 }
      );
    });
  }

  return { init, animateCartItems, animateFilter };
})();


/* ═══════════════════════════════════════════════════════════
   2. CURSOR MODULE
   ═══════════════════════════════════════════════════════════ */
const CursorModule = (() => {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  const lag = 0.14;

  function init() {
    // Hide on touch devices
    if (window.matchMedia('(hover: none)').matches) return;
    if (!dot || !ring) return;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      gsap.set(dot, { x: mx, y: my });
    });

    // Ring trails with lag
    (function loop() {
      rx += (mx - rx) * lag;
      ry += (my - ry) * lag;
      gsap.set(ring, { x: rx, y: ry });
      requestAnimationFrame(loop);
    })();

    // Hover states
    const els = document.querySelectorAll(
      'a, button, .filter-btn, .product-card, .col-card, .pillar, .magnetic, input, textarea, select'
    );
    els.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hovering'));
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   3. BURGER / MOBILE MENU MODULE
   ═══════════════════════════════════════════════════════════ */
const BurgerModule = (() => {
  const burger     = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  let isOpen = false;

  function init() {
    if (!burger || !mobileMenu) return;

    burger.addEventListener('click', toggle);

    // Close on nav link click
    mobileLinks.forEach(link => link.addEventListener('click', close));

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) close();
    });
  }

  function toggle() {
    isOpen ? close() : open();
  }

  function open() {
    isOpen = true;
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Stagger mobile links in
    gsap.fromTo('.mobile-nav-link',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0,
        duration: 0.5, ease: 'power3.out',
        stagger: 0.07, delay: 0.25 }
    );
  }

  function close() {
    isOpen = false;
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   4. CART MODULE
   ═══════════════════════════════════════════════════════════ */
const CartModule = (() => {

  /* ── State ── */
  let cart = JSON.parse(localStorage.getItem('lumiere_cart') ?? '[]');

  /* ── DOM refs ── */
  const drawer    = document.getElementById('cartDrawer');
  const overlay   = document.getElementById('cartOverlay');
  const itemsEl   = document.getElementById('cartItems');
  const emptyEl   = document.getElementById('cartEmpty');
  const footerEl  = document.getElementById('cartFooter');
  const badgeEl   = document.getElementById('cartBadge');
  const totalEl   = document.getElementById('cartTotal');

  function init() {
    // Open / close bindings
    document.getElementById('cartToggle')?.addEventListener('click', openCart);
    document.getElementById('cartClose')?.addEventListener('click',  closeCart);
    overlay?.addEventListener('click', closeCart);

    // Delegated add-to-cart
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-add-cart');
      if (!btn) return;
      const name  = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      if (!name || isNaN(price)) return;
      addItem(name, price);
      showToast(`${name} added to cart ✦`);
    });

    // Header scroll class
    window.addEventListener('scroll', () => {
      document.getElementById('siteHeader')
        ?.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // Search overlay
    initSearch();

    // Contact form
    document.getElementById('contactForm')?.addEventListener('submit', e => {
      e.preventDefault();
      showToast('Message sent — we\'ll be in touch ✦');
      e.target.reset();
    });

    // Initial render
    renderCart();
    updateBadge();
  }

  /* ── Open / close ── */
  function openCart() {
    drawer?.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    AnimationModule.animateCartItems();
  }
  function closeCart() {
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Add item ── */
  function addItem(name, price) {
    const ex = cart.find(i => i.name === name);
    if (ex) { ex.qty++; }
    else { cart.push({ id: Date.now(), name, price, qty: 1 }); }
    save(); renderCart(); updateBadge();
  }

  /* ── Render ── */
  function renderCart() {
    itemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

    if (!cart.length) {
      emptyEl.style.display  = 'flex';
      footerEl.style.display = 'none';
      return;
    }
    emptyEl.style.display  = 'none';
    footerEl.style.display = 'block';

    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      itemsEl.appendChild(buildItemEl(item));
    });
    if (totalEl) totalEl.textContent = `$${total.toLocaleString()}`;
  }

  function buildItemEl(item) {
    const el = document.createElement('div');
    el.className  = 'cart-item';
    el.dataset.id = item.id;
    el.innerHTML  = `
      <div class="cart-item-img"></div>
      <div>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">$${item.price}</p>
        <div class="qty-control">
          <button class="qty-btn minus" aria-label="Decrease quantity">−</button>
          <span   class="qty-num">${item.qty}</span>
          <button class="qty-btn plus"  aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cart-item-remove" aria-label="Remove ${item.name} from cart">✕</button>
    `;
    el.querySelector('.plus') .addEventListener('click', () => changeQty(item.id,  1));
    el.querySelector('.minus').addEventListener('click', () => changeQty(item.id, -1));
    el.querySelector('.cart-item-remove').addEventListener('click', () => removeItem(item.id));
    return el;
  }

  /* ── Quantity / remove ── */
  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeItem(id);
    else { save(); renderCart(); updateBadge(); }
  }

  function removeItem(id) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    const el = itemsEl.querySelector(`[data-id="${id}"]`);
    if (el) {
      gsap.to(el, {
        opacity: 0, x: 30, height: 0, paddingTop: 0, paddingBottom: 0,
        duration: 0.35, ease: 'power2.in',
        onComplete: () => {
          cart.splice(idx, 1);
          save(); renderCart(); updateBadge();
        }
      });
    } else {
      cart.splice(idx, 1);
      save(); renderCart(); updateBadge();
    }
  }

  /* ── Badge ── */
  function updateBadge() {
    const n = cart.reduce((a, i) => a + i.qty, 0);
    if (badgeEl) {
      badgeEl.textContent = n;
      badgeEl.classList.toggle('visible', n > 0);
    }
  }

  function save() {
    localStorage.setItem('lumiere_cart', JSON.stringify(cart));
  }

  /* ── Search overlay ── */
  function initSearch() {
    const overlay = document.getElementById('searchOverlay');
    const toggle  = document.getElementById('searchToggle');
    const close   = document.getElementById('searchClose');
    const input   = document.getElementById('searchInput');

    toggle?.addEventListener('click', () => {
      overlay?.classList.add('open');
      overlay?.setAttribute('aria-hidden', 'false');
      setTimeout(() => input?.focus(), 400);
    });

    const closeSearch = () => {
      overlay?.classList.remove('open');
      overlay?.setAttribute('aria-hidden', 'true');
    };

    close?.addEventListener('click', closeSearch);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeSearch();
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   5. FILTER MODULE
   ═══════════════════════════════════════════════════════════ */
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

        // Partition
        const hide = [];
        const show = [];
        cards.forEach(card => {
          const match = filter === 'all' || card.dataset.cat === filter;
          (match ? show : hide).push(card);
        });

        AnimationModule.animateFilter(hide, show);
      });
    });
  }

  return { init };
})();


/* ═══════════════════════════════════════════════════════════
   6. MAGNETIC BUTTONS
   ═══════════════════════════════════════════════════════════ */
function initMagnetic() {
  // Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.magnetic').forEach(el => {
    const strength = 0.32;

    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      gsap.to(el, {
        x: (e.clientX - cx) * strength,
        y: (e.clientY - cy) * strength,
        duration: 0.3, ease: 'power2.out'
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0, y: 0,
        duration: 0.55, ease: 'elastic.out(1, 0.5)'
      });
    });
  });
}


/* ═══════════════════════════════════════════════════════════
   TOAST UTILITY
   ═══════════════════════════════════════════════════════════ */
let _toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3300);
}


/* ═══════════════════════════════════════════════════════════
   BOOTSTRAP
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  AnimationModule.init();   // GSAP animations
  CursorModule.init();      // Custom cursor
  BurgerModule.init();      // Mobile burger menu
  CartModule.init();        // Cart drawer + Add-to-cart
  FilterModule.init();      // Collection filter tabs
  initMagnetic();           // Magnetic button effect
});