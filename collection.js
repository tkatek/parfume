/* ============================================================
   LUMIÈRE — collection.js
   Handles: Sidebar filtering, Sort, View toggle, Cart, Cursor
   ============================================================ */

'use strict';

gsap.registerPlugin(ScrollTrigger);

/* ─── Shared state ────────────────────────────────────────────── */
let cartState = JSON.parse(localStorage.getItem('lumiere_cart') || '[]');

/* ─── DOM refs ────────────────────────────────────────────────── */
const grid        = document.getElementById('collGrid');
const allItems    = () => [...grid.querySelectorAll('.coll-item')];
const countEl     = document.getElementById('visibleCount');
const sortSelect  = document.getElementById('sortSelect');

/* ─── Page Load Animations ────────────────────────────────────── */
(function initPageAnimations() {
  // Hero
  gsap.from('.coll-hero-content > *', {
    y: 40, opacity: 0, duration: 0.9,
    ease: 'power3.out', stagger: 0.12, delay: 0.3
  });

  gsap.from('.coll-hero-scroll', { opacity: 0, duration: 0.6, delay: 1 });

  // Sidebar
  gsap.from('.sidebar-section', {
    scrollTrigger: { trigger: '.coll-sidebar', start: 'top 85%', once: true },
    opacity: 0, x: -20, duration: 0.7, ease: 'power2.out', stagger: 0.1
  });

  // Cards batch
  ScrollTrigger.batch('.coll-item', {
    onEnter: batch => {
      gsap.from(batch, {
        opacity: 0, y: 24, duration: 0.65,
        ease: 'power2.out', stagger: 0.07
      });
    },
    start: 'top 88%',
    once: true
  });
})();

/* ─── Sidebar Category Filter ─────────────────────────────────── */
(function initCategoryFilter() {
  const radios = document.querySelectorAll('input[name="cat"]');
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      const val = radio.value;
      const items = allItems();
      const hide = [];
      const show = [];

      items.forEach(item => {
        const match = val === 'all' || item.dataset.cat === val;
        match ? show.push(item) : hide.push(item);
      });

      animateFilterChange(hide, show);
      updateCount(show.length);
    });
  });
})();

/* ─── Sort ────────────────────────────────────────────────────── */
sortSelect?.addEventListener('change', () => {
  const val = sortSelect.value;
  const items = allItems();

  const sorted = [...items].sort((a, b) => {
    switch (val) {
      case 'price-asc':  return parseInt(a.dataset.price) - parseInt(b.dataset.price);
      case 'price-desc': return parseInt(b.dataset.price) - parseInt(a.dataset.price);
      case 'name':       return a.dataset.name.localeCompare(b.dataset.name);
      default:           return 0;
    }
  });

  gsap.to(items, { opacity: 0, y: -10, duration: 0.2, stagger: 0.02, onComplete: () => {
    sorted.forEach(item => grid.appendChild(item));
    gsap.from(sorted, { opacity: 0, y: 20, duration: 0.45, stagger: 0.04, ease: 'power2.out' });
  }});
});

/* ─── View Toggle (Grid / List) ───────────────────────────────── */
(function initViewToggle() {
  const btns = document.querySelectorAll('.view-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.dataset.view;
      if (view === 'list') {
        grid.classList.add('list-view');
      } else {
        grid.classList.remove('list-view');
      }

      gsap.from('.coll-item', {
        opacity: 0, scale: 0.97, duration: 0.4,
        ease: 'power2.out', stagger: 0.04
      });
    });
  });
})();

/* ─── Pagination buttons (UI only) ───────────────────────────── */
document.querySelectorAll('.page-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
    if (!btn.classList.contains('page-next')) btn.classList.add('active');
  });
});

/* ─── Sidebar Reset ───────────────────────────────────────────── */
document.querySelector('.sidebar-reset')?.addEventListener('click', () => {
  document.querySelectorAll('input[name="cat"]')[0].checked = true;
  document.querySelectorAll('input[name="price"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

  const items = allItems();
  items.forEach(el => { el.style.display = ''; });
  gsap.fromTo(items, { opacity: 0, y: 10 }, {
    opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out'
  });
  updateCount(items.length);
});

/* ─── GSAP filter animation ───────────────────────────────────── */
function animateFilterChange(hide, show) {
  const tl = gsap.timeline();
  if (hide.length) {
    tl.to(hide, {
      opacity: 0, scale: 0.93, duration: 0.3,
      ease: 'power2.in', stagger: 0.025,
      onComplete: () => hide.forEach(el => (el.style.display = 'none'))
    });
  }
  tl.call(() => {
    show.forEach(el => { el.style.display = ''; });
    gsap.fromTo(show, { opacity: 0, scale: 0.95, y: 12 }, {
      opacity: 1, scale: 1, y: 0,
      duration: 0.45, ease: 'power2.out', stagger: 0.04
    });
  });
}

/* ─── Cart Module (shared) ────────────────────────────────────── */
(function initCart() {
  const cartDrawer  = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooter  = document.getElementById('cartFooter');
  const cartBadge   = document.getElementById('cartBadge');
  const cartTotal   = document.getElementById('cartTotal');

  renderCart();
  updateBadge();

  document.getElementById('cartToggle')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  document.addEventListener('click', handleAddToCart);

  // Header scroll
  window.addEventListener('scroll', () => {
    document.getElementById('siteHeader')?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    const items = document.querySelectorAll('.cart-item');
    gsap.to(items, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, delay: 0.2 });
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

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
    const ex = cartState.find(i => i.name === name);
    if (ex) ex.qty++;
    else cartState.push({ name, price, qty: 1, id: Date.now() });
    save();
    renderCart();
    updateBadge();
  }

  function renderCart() {
    cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());
    if (!cartState.length) {
      cartEmptyEl.style.display = 'flex';
      cartFooter.style.display  = 'none';
      return;
    }
    cartEmptyEl.style.display = 'none';
    cartFooter.style.display  = 'block';
    let total = 0;
    cartState.forEach(item => {
      total += item.price * item.qty;
      cartItemsEl.appendChild(createItemEl(item));
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
          <button class="qty-btn minus">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn plus">+</button>
        </div>
      </div>
      <button class="cart-item-remove">✕</button>
    `;
    el.querySelector('.plus').addEventListener('click', () => changeQty(item.id, 1));
    el.querySelector('.minus').addEventListener('click', () => changeQty(item.id, -1));
    el.querySelector('.cart-item-remove').addEventListener('click', () => removeItem(item.id));
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
    const el = cartItemsEl.querySelector(`[data-id="${id}"]`);
    if (el) {
      gsap.to(el, { opacity: 0, x: 30, height: 0, padding: 0, duration: 0.35, ease: 'power2.in',
        onComplete: () => { cartState.splice(idx, 1); save(); renderCart(); updateBadge(); }
      });
    } else { cartState.splice(idx, 1); save(); renderCart(); updateBadge(); }
  }

  function updateBadge() {
    const total = cartState.reduce((a, i) => a + i.qty, 0);
    cartBadge.textContent = total;
    cartBadge.classList.toggle('visible', total > 0);
  }

  function save() { localStorage.setItem('lumiere_cart', JSON.stringify(cartState)); }
})();

/* ─── Custom Cursor ───────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; gsap.set(dot, { x: mx, y: my }); });
  (function loop() { rx += (mx-rx)*0.14; ry += (my-ry)*0.14; gsap.set(ring, { x: rx, y: ry }); requestAnimationFrame(loop); })();
  document.querySelectorAll('a,button,.coll-item,.sidebar-check').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hovering'));
  });
})();

/* ─── Magnetic buttons ────────────────────────────────────────── */
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width/2)) * 0.35;
    const dy = (e.clientY - (r.top  + r.height/2)) * 0.35;
    gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => gsap.to(el, { x:0, y:0, duration:0.5, ease:'elastic.out(1,0.5)' }));
});

/* ─── Utilities ───────────────────────────────────────────────── */
function updateCount(n) { if (countEl) countEl.textContent = n; }

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}