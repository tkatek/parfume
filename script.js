/* ══════════════════════════════════════════════════════════
   LUMIÈRE — script.js  v3 Final
   
   KEY FIX: Elements are VISIBLE by default (no opacity:0 in CSS).
   The body gets class "gsap-ready" only AFTER GSAP loads, which 
   triggers CSS to hide elements before GSAP animates them in.
   This prevents the blank-screen / invisible-hero bug.

   Modules:
   1. SafeGSAP      — wrapper that activates gsap-ready flag
   2. HeroModule    — hero floating + circle animations
   3. ScrollReveal  — scroll-triggered reveals (safe, non-blocking)
   4. BurgerModule  — mobile menu
   5. CartModule    — cart drawer + add-to-cart
   6. FilterModule  — store section category filter
   7. CursorModule  — custom cursor (desktop only)
   8. SearchModule  — search overlay
   9. Bootstrap     — wires everything on DOMContentLoaded
══════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════
   1. SAFE GSAP WRAPPER
══════════════════════════════════════════════════════════ */
function initGSAP() {
  if (typeof gsap === 'undefined') {
    console.warn('LUMIÈRE: GSAP not loaded — animations disabled, content visible.');
    return false;
  }
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
  // NOW it's safe to hide elements for animation
  document.body.classList.add('gsap-ready');
  return true;
}

/* ══════════════════════════════════════════════════════════
   2. HERO MODULE
   Floating bottle + parallax circles (CSS handles most of it)
══════════════════════════════════════════════════════════ */
function initHero() {
  if (typeof gsap === 'undefined') return;

  const float = document.getElementById('heroFloat');
  if (!float) return;

  // Gentle float — yoyo
  gsap.to(float, {
    y: -18,
    duration: 3.8,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1
  });

  // Animate hero copy in on load
  const tl = gsap.timeline({ delay: 0.1 });

  tl.from('.hero-eyebrow', {
    opacity: 0, y: 16,
    duration: 0.7, ease: 'power2.out'
  })
  .from('.ht-word', {
    opacity: 0, y: 30,
    duration: 0.7, ease: 'power3.out',
    stagger: 0.08
  }, '-=0.3')
  .from('.hero-desc', {
    opacity: 0, y: 16,
    duration: 0.6, ease: 'power2.out'
  }, '-=0.3')
  .from('.hero-actions', {
    opacity: 0, y: 12,
    duration: 0.6, ease: 'power2.out'
  }, '-=0.3')
  .from('.hero-product-wrap', {
    opacity: 0, x: 40,
    duration: 0.9, ease: 'power3.out'
  }, '-=0.8')
  .from('#heroCircle1', {
    opacity: 0, scale: 0.6,
    duration: 0.6, ease: 'back.out(2)'
  }, '-=0.4')
  .from('#heroCircle2', {
    opacity: 0, scale: 0.6,
    duration: 0.6, ease: 'back.out(2)'
  }, '-=0.4')
  .from('.hero-bg-text .hbt-line', {
    opacity: 0, x: -30,
    duration: 0.7, ease: 'power2.out',
    stagger: 0.06
  }, 0)
  .from('.scroll-ind', {
    opacity: 0, duration: 0.5
  }, '-=0.2');
}

/* ══════════════════════════════════════════════════════════
   3. SCROLL REVEAL
   Uses ScrollTrigger batch for performance.
   All targets must have .anim-hidden or .anim-hidden-x class
   added by JS (not hardcoded in HTML) to stay safe.
══════════════════════════════════════════════════════════ */
function initScrollReveal() {
  if (typeof ScrollTrigger === 'undefined') {
    document.querySelectorAll('.anim-hidden, .anim-hidden-x').forEach(el => {
      el.classList.remove('anim-hidden', 'anim-hidden-x');
    });
    return;
  }

  // Helper — add class then animate
  function revealBatch(selector, options = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    ScrollTrigger.batch(selector, {
      onEnter: batch => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          x: 0,
          duration: options.duration || 0.75,
          ease: options.ease || 'power3.out',
          stagger: options.stagger || 0.1
        });
      },
      start: 'top 88%',
      once: true
    });
  }

  // Section headers
  document.querySelectorAll('.sec-label, .sec-title, .sec-sub, .phil-title, .about-title, .contact-title, .whyus-title').forEach(el => {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        opacity: 0, y: 22,
        duration: 0.75, ease: 'power3.out'
      });
    } else {
      gsap.from(el, {
        opacity: 0, y: 22,
        duration: 0.75, ease: 'power3.out'
      });
    }
  });

  // Product cards (top sales)
  revealBatch('.p-card', { stagger: 0.11, duration: 0.75 });

  // Store cards
  revealBatch('.sg-card', { stagger: 0.09, duration: 0.65 });

  // Philosophy images
  document.querySelectorAll('.pi').forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      opacity: 0, y: 25,
      duration: 0.75,
      delay: i * 0.1,
      ease: 'power2.out'
    });
  });

  // Philosophy pillars
  gsap.from('.ppillar', {
    scrollTrigger: { trigger: '.phil-pillars', start: 'top 86%', once: true },
    opacity: 0, x: -20,
    duration: 0.65, ease: 'power2.out',
    stagger: 0.12
  });

  // About images
  document.querySelectorAll('.ai-wrap').forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      opacity: 0, y: 30,
      duration: 0.8, delay: i * 0.12,
      ease: 'power3.out'
    });
  });

  // Contact left
  gsap.from('.contact-left > *', {
    scrollTrigger: { trigger: '.contact-section', start: 'top 80%', once: true },
    opacity: 0, x: -24,
    duration: 0.75, ease: 'power3.out',
    stagger: 0.1
  });

  // Contact form fields
  gsap.from('.cf-field, .btn-send', {
    scrollTrigger: { trigger: '.contact-form', start: 'top 85%', once: true },
    opacity: 0, y: 16,
    duration: 0.6, ease: 'power2.out',
    stagger: 0.07
  });

  // Footer
  gsap.from('.footer-brand, .fl-col, .footer-newsletter', {
    scrollTrigger: { trigger: '.site-footer', start: 'top 87%', once: true },
    opacity: 0, y: 16,
    duration: 0.6, ease: 'power2.out',
    stagger: 0.08
  });

  // Parallax — philosophy images
  document.querySelectorAll('.pi').forEach(el => {
    const speed = el.classList.contains('pi-1') ? -0.06
                : el.classList.contains('pi-2') ? 0.05
                : -0.04;
    gsap.to(el.querySelector('img'), {
      yPercent: speed * 40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.phil-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   4. BURGER MODULE
══════════════════════════════════════════════════════════ */
function initBurger() {
  const btn   = document.getElementById('burgerBtn');
  const menu  = document.getElementById('mobileMenu');
  const links = document.querySelectorAll('.m-link');
  if (!btn || !menu) return;

  let open = false;

  function openMenu() {
    open = true;
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.m-link',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.07, delay: 0.2 }
      );
    }
  }

  function closeMenu() {
    open = false;
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => open ? closeMenu() : openMenu());
  links.forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closeMenu(); });
}

/* ══════════════════════════════════════════════════════════
   5. CART MODULE
══════════════════════════════════════════════════════════ */
function initCart() {
  /* ── State ── */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('lumiere_cart') || '[]'); } catch(e) {}

  cart = cart.map(item => ({
    ...item,
    image: item.image || item.img || ''
  }));

  /* ── DOM ── */
  const drawer    = document.getElementById('cartDrawer');
  const overlay   = document.getElementById('cartOverlay');
  const itemsEl   = document.getElementById('cartItems');
  const emptyEl   = document.getElementById('cartEmpty');
  const footEl    = document.getElementById('cartFoot');
  const badgeEl   = document.getElementById('cartBadge');
  const subtotEl  = document.getElementById('cartSubtotal');
  const totalEl   = document.getElementById('cartTotal');
  const countEl   = document.getElementById('cartCount');

  if (!drawer) return;

  /* ── Open / Close ── */
  function openCart() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // stagger items in
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.cd-item',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', stagger: 0.07, delay: 0.15 }
      );
    }
  }

  function closeCart() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.getElementById('cartToggle')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  overlay?.addEventListener('click', closeCart);

  /* ── Add to Cart (delegated) ── */
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-add-cart');
    if (!btn) return;
    const name  = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    if (!name || isNaN(price)) return;
    const image = btn.dataset.img || btn.closest('article, .sg-card')?.querySelector('img')?.src || '';
    addItem(name, price, image);
    showToast(`${name} added to cart ✦`);
  });

  function addItem(name, price, image) {
    const ex = cart.find(i => i.name === name);
    if (ex) {
      ex.qty++;
    } else {
      cart.push({ id: Date.now(), name, price, qty: 1, image });
    }
    save(); render(); updateBadge();
  }

  function removeItem(id) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    const el = itemsEl.querySelector(`[data-id="${id}"]`);
    if (el && typeof gsap !== 'undefined') {
      gsap.to(el, {
        opacity: 0, x: 30, height: 0, paddingTop: 0, paddingBottom: 0,
        duration: 0.3, ease: 'power2.in',
        onComplete: () => { cart.splice(idx, 1); save(); render(); updateBadge(); }
      });
    } else {
      cart.splice(idx, 1);
      save(); render(); updateBadge();
    }
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeItem(id);
    else { save(); render(); updateBadge(); }
  }

  /* ── Render ── */
  function render() {
    itemsEl.querySelectorAll('.cd-item').forEach(el => el.remove());

    if (!cart.length) {
      emptyEl.style.display = 'flex';
      footEl.style.display  = 'none';
      return;
    }
    emptyEl.style.display = 'none';
    footEl.style.display  = 'block';

    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      itemsEl.appendChild(buildItem(item));
    });

    if (subtotEl) subtotEl.textContent = '$' + total.toLocaleString();
    if (totalEl)  totalEl.textContent  = '$' + total.toLocaleString();
    if (countEl)  countEl.textContent  = `(${cart.reduce((a,i) => a + i.qty, 0)})`;
  }

  function buildItem(item) {
    const el = document.createElement('div');
    el.className  = 'cd-item';
    el.dataset.id = item.id;
    const imageSrc = item.image || item.img || '';
    el.innerHTML = `
      <div class="cd-item-img">${imageSrc ? `<img src="${imageSrc}" alt="${item.name}" />` : ''}</div>
      <div>
        <p class="cd-item-name">${item.name}</p>
        <p class="cd-item-price">$${item.price}</p>
        <div class="qty-row">
          <button class="qb minus" aria-label="Decrease">−</button>
          <span class="qn">${item.qty}</span>
          <button class="qb plus"  aria-label="Increase">+</button>
        </div>
      </div>
      <button class="cd-rm" aria-label="Remove">✕</button>
    `;
    el.querySelector('.plus') .addEventListener('click', () => changeQty(item.id,  1));
    el.querySelector('.minus').addEventListener('click', () => changeQty(item.id, -1));
    el.querySelector('.cd-rm').addEventListener('click', () => removeItem(item.id));
    return el;
  }

  function updateBadge() {
    const n = cart.reduce((a, i) => a + i.qty, 0);
    if (badgeEl) {
      badgeEl.textContent = n;
      badgeEl.classList.toggle('show', n > 0);
    }
  }

  function save() {
    try { localStorage.setItem('lumiere_cart', JSON.stringify(cart)); } catch(e) {}
  }

  // Init
  render(); updateBadge();
}

/* ══════════════════════════════════════════════════════════
   6. FILTER MODULE — Store section
══════════════════════════════════════════════════════════ */
function initFilter() {
  const btns  = document.querySelectorAll('.fb');
  const cards = document.querySelectorAll('.sg-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const hide = [], show = [];
      cards.forEach(c => (filter === 'all' || c.dataset.cat === filter ? show : hide).push(c));

      if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline();
        if (hide.length) {
          tl.to(hide, {
            opacity: 0, scale: 0.94, y: 8,
            duration: 0.28, ease: 'power2.in',
            stagger: 0.02,
            onComplete: () => hide.forEach(el => (el.style.display = 'none'))
          });
        }
        tl.call(() => {
          show.forEach(el => (el.style.display = ''));
          gsap.fromTo(show,
            { opacity: 0, scale: 0.96, y: 10 },
            { opacity: 1, scale: 1, y: 0, duration: 0.38, ease: 'power2.out', stagger: 0.04 }
          );
        });
      } else {
        hide.forEach(el => (el.style.display = 'none'));
        show.forEach(el => (el.style.display = ''));
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   7. CUSTOM CURSOR (desktop only)
══════════════════════════════════════════════════════════ */
function initCursor() {
  // Only on non-touch devices
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (typeof gsap !== 'undefined') gsap.set(dot, { x: mx, y: my });
    else { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
  });

  // Ring lags behind
  (function loopRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    if (typeof gsap !== 'undefined') gsap.set(ring, { x: rx, y: ry });
    else { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(loopRing);
  })();

  // Hover states
  document.querySelectorAll('a, button, .p-card, .sg-card, .fb, .ppillar, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('c-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('c-hover'));
  });
}

/* ══════════════════════════════════════════════════════════
   8. SEARCH MODULE
══════════════════════════════════════════════════════════ */
function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  const toggle  = document.getElementById('searchToggle');
  const close   = document.getElementById('searchClose');
  const input   = document.getElementById('searchInput');
  if (!overlay || !toggle) return;

  function open() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => input?.focus(), 350);
  }
  function close_() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', open);
  close?.addEventListener('click', close_);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close_(); });
}

/* ══════════════════════════════════════════════════════════
   HEADER SCROLL CLASS
══════════════════════════════════════════════════════════ */
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
}

/* ══════════════════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Message sent — we\'ll be in touch ✦');
    form.reset();
  });
}

/* ══════════════════════════════════════════════════════════
   NEWSLETTER FORM
══════════════════════════════════════════════════════════ */
function initNewsletter() {
  document.querySelectorAll('.nl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input && input.value.includes('@')) {
        showToast('Subscribed! Welcome to the Lumière Letter ✦');
        input.value = '';
      } else {
        showToast('Please enter a valid email address.');
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   TOAST UTILITY
══════════════════════════════════════════════════════════ */
let _toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ══════════════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
   Overrides default browser jump for nav links
══════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const hhPx = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hh')) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - hhPx;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════════════════════════════════
   BOOTSTRAP — DOMContentLoaded
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Init GSAP (marks body.gsap-ready if available)
  const gsapOk = initGSAP();

  // 2. UI modules (no GSAP dependency)
  initHeader();
  initBurger();
  initCart();
  initFilter();
  initSearch();
  initContactForm();
  initNewsletter();
  initSmoothScroll();
  initCursor();

  // 3. Animations (GSAP dependent — gracefully degrade)
  if (gsapOk) {
    initHero();
    initScrollReveal();
  }
});