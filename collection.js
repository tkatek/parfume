/* ============================================================
   LUMIÈRE — collection.js
   Horizontal filter, sorting, view toggle, cart, cursor
   ============================================================ */

(function () {
  'use strict';

  /* ── State ─────────────────────────────────────────────────── */
  let activeCategory = 'all';
  let cart = JSON.parse(localStorage.getItem('lumiere_cart') || '[]');

  /* ── DOM refs ───────────────────────────────────────────────── */
  const grid        = document.getElementById('collGrid');
  const allItems    = () => [...grid.querySelectorAll('.coll-item')];
  const countEl     = document.getElementById('visibleCount');
  const sortSel     = document.getElementById('sortSelect');
  const filterTabs  = document.querySelectorAll('.filter-tab');
  const pill        = document.getElementById('filterPill');
  const emptyState  = document.getElementById('collEmpty');
  const viewBtns    = document.querySelectorAll('.view-btn');
  const cartToggle  = document.getElementById('cartToggle');
  const cartClose   = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooter  = document.getElementById('cartFooter');
  const cartBadge   = document.getElementById('cartBadge');
  const cartTotalEl = document.getElementById('cartTotal');
  const toast       = document.getElementById('toast');
  const header      = document.getElementById('siteHeader');

  /* ─────────────────────────────────────────────────────────────
     HORIZONTAL FILTER
  ───────────────────────────────────────────────────────────── */
  function movePill(tab) {
    const trackRect = document.querySelector('.filter-underline-track').getBoundingClientRect();
    const tabRect   = tab.getBoundingClientRect();
    pill.style.left  = (tabRect.left - trackRect.left) + 'px';
    pill.style.width = tabRect.width + 'px';
  }

  function applyFilter(cat) {
    activeCategory = cat;

    // Update tab states
    filterTabs.forEach(t => {
      const isActive = t.dataset.cat === cat;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', isActive);
      if (isActive) movePill(t);
    });

    renderGrid();
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => applyFilter(tab.dataset.cat));
  });

  // Initialise pill position on load
  window.addEventListener('load', () => {
    const activeTab = document.querySelector('.filter-tab.active');
    if (activeTab) movePill(activeTab);
  });

  // Keep pill aligned on resize
  window.addEventListener('resize', () => {
    const activeTab = document.querySelector('.filter-tab.active');
    if (activeTab) movePill(activeTab);
  });

  /* ─────────────────────────────────────────────────────────────
     SORT
  ───────────────────────────────────────────────────────────── */
  function getSortedItems(items) {
    const sorted = [...items];
    const mode = sortSel ? sortSel.value : 'featured';
    switch (mode) {
      case 'price-asc':  return sorted.sort((a, b) => +a.dataset.price - +b.dataset.price);
      case 'price-desc': return sorted.sort((a, b) => +b.dataset.price - +a.dataset.price);
      case 'name':       return sorted.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name, 'fr'));
      default:           return sorted; // featured = DOM order
    }
  }

  if (sortSel) sortSel.addEventListener('change', renderGrid);

  /* ─────────────────────────────────────────────────────────────
     RENDER (filter + sort + animate)
  ───────────────────────────────────────────────────────────── */
  function renderGrid() {
    const items = allItems();

    // Filter
    const visible = items.filter(item => {
      return activeCategory === 'all' || item.dataset.cat === activeCategory;
    });
    const hidden  = items.filter(item => !visible.includes(item));

    // Sort
    const sorted = getSortedItems(visible);

    // Hide filtered-out
    hidden.forEach(item => {
      item.classList.add('hidden');
      item.classList.remove('reveal');
    });

    // Re-order & reveal visible
    sorted.forEach((item, i) => {
      item.classList.remove('hidden', 'reveal');
      grid.appendChild(item); // re-order in DOM
      // staggered reveal
      item.style.animationDelay = (i * 0.04) + 's';
      void item.offsetWidth; // reflow
      item.classList.add('reveal');
    });

    // Count
    if (countEl) countEl.textContent = visible.length;

    // Empty state
    if (emptyState) {
      emptyState.style.display = visible.length === 0 ? 'block' : 'none';
    }
  }

  /* ─────────────────────────────────────────────────────────────
     VIEW TOGGLE (grid / list)
  ───────────────────────────────────────────────────────────── */
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      grid.classList.toggle('list-view', btn.dataset.view === 'list');
    });
  });

  /* ─────────────────────────────────────────────────────────────
     CART
  ───────────────────────────────────────────────────────────── */
  function saveCart() {
    localStorage.setItem('lumiere_cart', JSON.stringify(cart));
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCart();
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderCart() {
    // Clear previous items (keep empty msg)
    [...cartItemsEl.querySelectorAll('.cart-line')].forEach(el => el.remove());

    if (cart.length === 0) {
      cartEmptyEl.style.display = 'block';
      cartFooter.style.display  = 'none';
    } else {
      cartEmptyEl.style.display = 'none';
      cartFooter.style.display  = 'block';

      cart.forEach((item, i) => {
        const line = document.createElement('div');
        line.className = 'cart-line';
        line.style.cssText = `
          display:flex; justify-content:space-between; align-items:center;
          padding:.9rem 0; border-bottom:1px solid rgba(26,23,20,.07);
          font-family:'Jost',sans-serif; font-size:.78rem; color:#1a1714;
        `;
        line.innerHTML = `
          <div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:400;">${item.name}</div>
            <div style="color:#6b6460;font-weight:300;margin-top:.15rem;">$${item.price}</div>
          </div>
          <button data-idx="${i}" style="background:none;border:none;cursor:pointer;color:#6b6460;font-size:1rem;transition:color .2s ease;" aria-label="Remove">✕</button>
        `;
        line.querySelector('button').addEventListener('click', e => {
          cart.splice(+e.currentTarget.dataset.idx, 1);
          saveCart();
          updateBadge();
          renderCart();
        });
        cartItemsEl.appendChild(line);
      });

      const total = cart.reduce((s, i) => s + i.price, 0);
      if (cartTotalEl) cartTotalEl.textContent = '$' + total;
    }
  }

  function updateBadge() {
    if (cartBadge) cartBadge.textContent = cart.length;
  }

  function addToCart(name, price) {
    cart.push({ name, price: +price });
    saveCart();
    updateBadge();
    showToast(name + ' added');
  }

  if (cartToggle)  cartToggle.addEventListener('click', openCart);
  if (cartClose)   cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Quick Add buttons (event delegation)
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.coll-quick');
    if (!btn) return;
    e.stopPropagation();
    addToCart(btn.dataset.name, btn.dataset.price);
  });

  /* ─────────────────────────────────────────────────────────────
     TOAST
  ───────────────────────────────────────────────────────────── */
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* ─────────────────────────────────────────────────────────────
     HEADER SCROLL BEHAVIOUR
  ───────────────────────────────────────────────────────────── */
  if (header) {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.style.background = y > 60 ? 'rgba(249,246,241,.92)' : '';
      header.style.backdropFilter = y > 60 ? 'blur(12px)' : '';
      header.style.boxShadow = y > 60 ? '0 1px 0 rgba(26,23,20,.08)' : '';
      lastY = y;
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────
     CUSTOM CURSOR
  ───────────────────────────────────────────────────────────── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (dot && ring && window.matchMedia('(pointer:fine)').matches) {
    let mx = -100, my = -100;
    let rx = -100, ry = -100;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

    document.querySelectorAll('button, a, [data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('expand'));
      el.addEventListener('mouseleave', () => ring.classList.remove('expand'));
    });

    (function animateCursor() {
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animateCursor);
    })();
  }

  /* ─────────────────────────────────────────────────────────────
     GSAP ENTRANCE ANIMATIONS
  ───────────────────────────────────────────────────────────── */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero
    gsap.from('.coll-hero-content > *', {
      opacity: 0,
      y: 24,
      duration: 1,
      stagger: .18,
      ease: 'power2.out',
      delay: .1
    });

    // Filter bar
    gsap.from('.coll-filter-bar', {
      opacity: 0,
      y: 16,
      duration: .8,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.coll-filter-bar', start: 'top 85%' }
    });

    // Cards on scroll
    ScrollTrigger.batch('.coll-item', {
      start: 'top 90%',
      onEnter: batch => gsap.from(batch, {
        opacity: 0,
        y: 30,
        duration: .65,
        stagger: .07,
        ease: 'power2.out',
        clearProps: 'all'
      })
    });
  }

  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */
  updateBadge();

})();