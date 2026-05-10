/* ================================================================
   LUMIÈRE — collection.js
   Full Collection page · Production ready
   Handles: header scroll · mobile sidebar · hero entrance ·
            horizontal filter + pill · sort · view toggle ·
            card entrance animations · quick-add · cart drawer ·
            custom cursor · toast
================================================================ */
'use strict';

(function () {

  /* ──────────────────────────────────────────────────────────────
     STATE
  ────────────────────────────────────────────────────────────── */
  let activeCat = 'all';
  let cart = [];

  try { cart = JSON.parse(localStorage.getItem('lumiere_cart') || '[]'); } catch (_) { cart = []; }

  /* ──────────────────────────────────────────────────────────────
     DOM REFS
  ────────────────────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const $$ = sel => [...document.querySelectorAll(sel)];

  const siteHeader    = $('siteHeader');
  const burgerBtn     = $('burgerBtn');
  const mobOverlay    = $('mobOverlay');
  const mobSidebar    = $('mobSidebar');
  const mobCloseBtn   = $('mobCloseBtn');

  const collHero      = document.querySelector('.coll-hero');
  const fTabs         = $$('.f-tab');
  const fPill         = $('fPill');
  const fTrack        = document.querySelector('.f-track');

  const sortSelect    = $('sortSelect');
  const viewBtns      = $$('.view-btn');
  const collGrid      = $('collGrid');
  const visibleCount  = $('visibleCount');
  const collEmpty     = $('collEmpty');

  const cartToggle    = $('cartToggle');
  const cartClose     = $('cartClose');
  const cartOverlay   = $('cartOverlay');
  const cartDrawer    = $('cartDrawer');
  const cartBadge     = $('cartBadge');
  const cartDrawerBody = $('cartDrawerBody');
  const cartEmptyState = $('cartEmptyState');
  const cartDrawerFt  = $('cartDrawerFt');
  const cartDrawerCount = $('cartDrawerCount');
  const cartTotal     = $('cartTotal');
  const toast         = $('toast');

  /* ──────────────────────────────────────────────────────────────
     HEADER – scroll behaviour
  ────────────────────────────────────────────────────────────── */
  function onScroll () {
    if (window.scrollY > 50) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ──────────────────────────────────────────────────────────────
     MOBILE SIDEBAR
  ────────────────────────────────────────────────────────────── */
  function openMobNav () {
    mobSidebar.classList.add('is-open');
    mobOverlay.classList.add('is-open');
    burgerBtn.classList.add('is-open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMobNav () {
    mobSidebar.classList.remove('is-open');
    mobOverlay.classList.remove('is-open');
    burgerBtn.classList.remove('is-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  burgerBtn.addEventListener('click', openMobNav);
  mobCloseBtn.addEventListener('click', closeMobNav);
  mobOverlay.addEventListener('click', closeMobNav);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobNav(); });

  /* ──────────────────────────────────────────────────────────────
     HERO ENTRANCE ANIMATION
  ────────────────────────────────────────────────────────────── */
  if (collHero) {
    // trigger the CSS transitions via class
    requestAnimationFrame(() => {
      setTimeout(() => collHero.classList.add('in-view'), 80);
    });
  }

  /* ──────────────────────────────────────────────────────────────
     FILTER PILL – position helper
  ────────────────────────────────────────────────────────────── */
  function movePill (tab) {
    if (!fPill || !fTrack) return;
    const trackRect = fTrack.getBoundingClientRect();
    const tabRect   = tab.getBoundingClientRect();
    fPill.style.left  = (tabRect.left - trackRect.left) + 'px';
    fPill.style.width = tabRect.width + 'px';
  }

  // Init pill on load
  window.addEventListener('load', () => {
    const active = document.querySelector('.f-tab--active');
    if (active) movePill(active);
  });

  window.addEventListener('resize', () => {
    const active = document.querySelector('.f-tab--active');
    if (active) movePill(active);
  });

  /* ──────────────────────────────────────────────────────────────
     FILTER + SORT – render grid
  ────────────────────────────────────────────────────────────── */
  function getCards () { return $$('.p-card'); }

  function renderGrid () {
    const cards   = getCards();
    const mode    = sortSelect ? sortSelect.value : 'featured';

    // Split visible / hidden
    const visible = cards.filter(c => activeCat === 'all' || c.dataset.cat === activeCat);
    const hidden  = cards.filter(c => !visible.includes(c));

    // Hide
    hidden.forEach(c => {
      c.classList.add('is-hidden');
      c.classList.remove('is-visible');
    });

    // Sort visible
    const sorted = [...visible];
    if (mode === 'price-asc')  sorted.sort((a, b) => +a.dataset.price - +b.dataset.price);
    if (mode === 'price-desc') sorted.sort((a, b) => +b.dataset.price - +a.dataset.price);
    if (mode === 'name')       sorted.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name, 'fr'));

    // Re-append in sorted order & reveal with stagger
    sorted.forEach((c, i) => {
      c.classList.remove('is-hidden');
      collGrid.appendChild(c);
      // reset then re-trigger entrance
      c.classList.remove('is-visible');
      c.style.transitionDelay = (i * 0.04) + 's';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => c.classList.add('is-visible'));
      });
    });

    // Update count
    if (visibleCount) visibleCount.textContent = visible.length;

    // Empty state
    if (collEmpty) {
      if (visible.length === 0) collEmpty.classList.add('show');
      else collEmpty.classList.remove('show');
    }
  }

  // Tab clicks
  fTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      fTabs.forEach(t => {
        t.classList.remove('f-tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('f-tab--active');
      tab.setAttribute('aria-selected', 'true');
      activeCat = tab.dataset.cat;
      movePill(tab);
      renderGrid();
    });
  });

  // Sort change
  if (sortSelect) sortSelect.addEventListener('change', renderGrid);

  /* ──────────────────────────────────────────────────────────────
     VIEW TOGGLE – grid / list
  ────────────────────────────────────────────────────────────── */
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('view-btn--active'));
      btn.classList.add('view-btn--active');
      collGrid.classList.toggle('list-view', btn.dataset.view === 'list');
    });
  });

  /* ──────────────────────────────────────────────────────────────
     CARD ENTRANCE (IntersectionObserver)
  ────────────────────────────────────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  function observeCards () {
    getCards().forEach(c => io.observe(c));
  }
  observeCards();

  /* ──────────────────────────────────────────────────────────────
     CART — localStorage persistence
  ────────────────────────────────────────────────────────────── */
  function saveCart () {
    try { localStorage.setItem('lumiere_cart', JSON.stringify(cart)); } catch (_) {}
  }

  function updateBadge () {
    const count = cart.length;
    if (cartBadge) {
      cartBadge.textContent = count;
      cartBadge.classList.add('bump');
      setTimeout(() => cartBadge.classList.remove('bump'), 300);
    }
    if (cartDrawerCount) cartDrawerCount.textContent = count;
  }

  /* ── Open / Close ── */
  function openCart () {
    cartDrawer.classList.add('is-open');
    cartOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    renderCart();
  }
  function closeCart () {
    cartDrawer.classList.remove('is-open');
    cartOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  /* ── Render cart items ── */
  function renderCart () {
    // Clear previous lines (keep empty state node)
    $$('.cart-line').forEach(el => el.remove());

    if (cart.length === 0) {
      cartEmptyState.style.display = 'flex';
      cartDrawerFt.classList.remove('show');
    } else {
      cartEmptyState.style.display = 'none';
      cartDrawerFt.classList.add('show');

      cart.forEach((item, idx) => {
        const line = document.createElement('div');
        line.className = 'cart-line';
        line.innerHTML = `
          <div class="cart-line__img">
            <img src="${item.img}" alt="${escapeHtml(item.name)}" loading="lazy">
          </div>
          <div class="cart-line__info">
            <p class="cart-line__name">${escapeHtml(item.name)}</p>
            <p class="cart-line__price">$${item.price}</p>
          </div>
          <button class="cart-line__remove" data-idx="${idx}" aria-label="Remove ${escapeHtml(item.name)}">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4">
              <line x1="1" y1="1" x2="11" y2="11"/>
              <line x1="11" y1="1" x2="1" y2="11"/>
            </svg>
          </button>
        `;
        cartDrawerBody.appendChild(line);
      });

      // Remove buttons
      $$('.cart-line__remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = +btn.dataset.idx;
          cart.splice(i, 1);
          saveCart();
          updateBadge();
          renderCart();
        });
      });

      // Total
      const total = cart.reduce((s, i) => s + i.price, 0);
      if (cartTotal) cartTotal.textContent = '$' + total;
    }
  }

  /* ── Add to cart ── */
  function addToCart (name, price, img) {
    cart.push({ name, price: +price, img });
    saveCart();
    updateBadge();
    showToast(name + ' added to cart');
  }

  /* Delegate quick-add clicks */
  collGrid.addEventListener('click', e => {
    const btn = e.target.closest('.p-card__add');
    if (!btn) return;
    e.stopPropagation();
    addToCart(
      btn.dataset.name,
      btn.dataset.price,
      btn.dataset.img
    );
  });

  /* ──────────────────────────────────────────────────────────────
     TOAST
  ────────────────────────────────────────────────────────────── */
  let toastTimer;
  function showToast (msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* ──────────────────────────────────────────────────────────────
     CUSTOM CURSOR
  ────────────────────────────────────────────────────────────── */
  const cursorDot  = $('cursorDot');
  const cursorRing = $('cursorRing');

  if (cursorDot && cursorRing && window.matchMedia('(pointer:fine)').matches) {
    let mx = -200, my = -200, rx = -200, ry = -200;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    const interactable = 'button, a, select, [data-cursor]';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(interactable)) cursorRing.classList.add('is-big');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(interactable)) cursorRing.classList.remove('is-big');
    });

    (function tick () {
      cursorDot.style.left  = mx + 'px';
      cursorDot.style.top   = my + 'px';
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';
      requestAnimationFrame(tick);
    })();
  }

  /* ──────────────────────────────────────────────────────────────
     HELPER
  ────────────────────────────────────────────────────────────── */
  function escapeHtml (str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ──────────────────────────────────────────────────────────────
     INIT
  ────────────────────────────────────────────────────────────── */
  updateBadge();
  renderCart();   // sync cart count on page load

})();