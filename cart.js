/* ================================================================
   LUMIÈRE — cart.js
   Shopping cart page · Production ready
   Features: localStorage cart · qty controls · remove with animation
             · live summary sidebar · WhatsApp checkout link · cursor
================================================================ */
'use strict';

(function () {

  /* ──────────────────────────────────────────────────────────────
     CONFIG — change this to your WhatsApp number
     Format: country code + number, no spaces, no "+"
     Examples: "212612345678" for Morocco, "33612345678" for France
  ────────────────────────────────────────────────────────────── */
  const WHATSAPP_NUMBER = '212600000000'; // ← REPLACE with real number

  /* ──────────────────────────────────────────────────────────────
     STATE
  ────────────────────────────────────────────────────────────── */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('lumiere_cart') || '[]'); } catch (_) { cart = []; }

  /* ──────────────────────────────────────────────────────────────
     DOM REFS
  ────────────────────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);

  const siteHeader     = $('siteHeader');
  const burgerBtn      = $('burgerBtn');
  const mobOverlay     = $('mobOverlay');
  const mobSidebar     = $('mobSidebar');
  const mobCloseBtn    = $('mobCloseBtn');

  const cartBadge      = $('cartBadge');
  const cartItemsList  = $('cartItemsList');
  const cartEmpty      = $('cartEmpty');
  const cartNotes      = $('cartNotes');
  const cartSummary    = $('cartSummary');
  const cartMain       = $('cartMain');

  const summaryLines   = $('summaryLines');
  const summarySubtotal= $('summarySubtotal');
  const summaryShipping= $('summaryShipping');
  const summaryTotal   = $('summaryTotal');
  const btnWhatsApp    = $('btnWhatsApp');

  const orderNotes     = $('orderNotes');
  const notesChar      = $('notesChar');
  const toast          = $('toast');

  const cursorDot      = $('cursorDot');
  const cursorRing     = $('cursorRing');

  /* ──────────────────────────────────────────────────────────────
     HEADER SCROLL
  ────────────────────────────────────────────────────────────── */
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
  siteHeader.classList.toggle('scrolled', window.scrollY > 50);

  /* ──────────────────────────────────────────────────────────────
     MOBILE SIDEBAR
  ────────────────────────────────────────────────────────────── */
  function openMob () {
    if (!mobSidebar || !mobOverlay || !burgerBtn) return;
    mobSidebar.classList.add('is-open');
    mobOverlay.classList.add('is-open');
    burgerBtn.classList.add('is-open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMob () {
    if (!mobSidebar || !mobOverlay || !burgerBtn) return;
    mobSidebar.classList.remove('is-open');
    mobOverlay.classList.remove('is-open');
    burgerBtn.classList.remove('is-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (burgerBtn && mobCloseBtn && mobOverlay) {
    burgerBtn.addEventListener('click', openMob);
    mobCloseBtn.addEventListener('click', closeMob);
    mobOverlay.addEventListener('click', closeMob);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMob(); });
  }

  /* ──────────────────────────────────────────────────────────────
     PERSIST CART
  ────────────────────────────────────────────────────────────── */
  function saveCart () {
    try { localStorage.setItem('lumiere_cart', JSON.stringify(cart)); } catch (_) {}
  }

  /* ──────────────────────────────────────────────────────────────
     HELPERS
  ────────────────────────────────────────────────────────────── */
  function esc (str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function calcTotal () {
    return cart.reduce((s, item) => s + item.price * item.qty, 0);
  }

  function updateBadge () {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    if (cartBadge) cartBadge.textContent = count;
  }

  let toastTimer;
  function showToast (msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* ──────────────────────────────────────────────────────────────
     WHATSAPP MESSAGE BUILDER
  ────────────────────────────────────────────────────────────── */
  function buildWhatsAppUrl () {
    const notes = orderNotes ? orderNotes.value.trim() : '';
    const total = calcTotal();

    let msg = '🌸 *LUMIÈRE — New Order*\n\n';
    msg += '*Items Ordered:*\n';

    cart.forEach((item, i) => {
      const lineTotal = item.price * item.qty;
      msg += `${i + 1}. ${item.name}\n`;
      msg += `   Qty: ${item.qty}  ·  $${item.price} each  ·  *$${lineTotal}*\n`;
    });

    msg += `\n*Order Total: $${total}*\n`;

    if (notes) {
      msg += `\n📝 *Customer Notes:*\n${notes}\n`;
    }

    msg += '\n—\nSent from LUMIÈRE Online Shop';

    const encoded = encodeURIComponent(msg);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  }

  function refreshWhatsAppLink () {
    if (btnWhatsApp) {
      if (cart.length === 0) {
        btnWhatsApp.setAttribute('href', '#');
        btnWhatsApp.style.opacity = '.45';
        btnWhatsApp.style.pointerEvents = 'none';
      } else {
        btnWhatsApp.setAttribute('href', buildWhatsAppUrl());
        btnWhatsApp.style.opacity = '';
        btnWhatsApp.style.pointerEvents = '';
      }
    }
  }

  // Rebuild WhatsApp link when notes change
  if (orderNotes) {
    orderNotes.addEventListener('input', () => {
      const len = orderNotes.value.length;
      if (notesChar) notesChar.textContent = len;
      refreshWhatsAppLink();
    });
  }

  /* ──────────────────────────────────────────────────────────────
     RENDER — full page
  ────────────────────────────────────────────────────────────── */
  function render () {
    // Badge
    updateBadge();

    const isEmpty = cart.length === 0;

    // Toggle empty / filled states
    cartEmpty.classList.toggle('show', isEmpty);
    if (cartNotes) cartNotes.style.display = isEmpty ? 'none' : 'block';
    if (cartSummary) cartSummary.style.display = isEmpty ? 'none' : '';

    // ── Items list ──
    cartItemsList.innerHTML = '';

    cart.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.dataset.idx = idx;
      row.innerHTML = `
        <div class="item-product">
          <div class="item-img">
            <img src="${esc(item.img)}" alt="${esc(item.name)}" loading="lazy">
          </div>
          <div class="item-details">
            <span class="item-cat">${esc(item.cat || 'Fragrance')}</span>
            <p class="item-name">${esc(item.name)}</p>
            <p class="item-conc">${esc(item.conc || 'Eau de Parfum')}</p>
          </div>
        </div>
        <div class="item-price">$${item.price}</div>
        <div class="item-qty">
          <button class="qty-btn qty-dec" data-idx="${idx}" aria-label="Decrease quantity">−</button>
          <div class="qty-num" aria-live="polite">${item.qty}</div>
          <button class="qty-btn qty-inc" data-idx="${idx}" aria-label="Increase quantity">+</button>
        </div>
        <div class="item-total">$${item.price * item.qty}</div>
        <button class="item-remove" data-idx="${idx}" aria-label="Remove ${esc(item.name)}">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
               stroke="currentColor" stroke-width="1.4">
            <line x1="1" y1="1" x2="13" y2="13"/>
            <line x1="13" y1="1" x2="1" y2="13"/>
          </svg>
        </button>
      `;
      cartItemsList.appendChild(row);
    });

    // Qty + remove events
    cartItemsList.querySelectorAll('.qty-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.idx;
        if (cart[i].qty > 1) {
          cart[i].qty--;
          saveCart();
          render();
        } else {
          removeItem(i);
        }
      });
    });
    cartItemsList.querySelectorAll('.qty-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.idx;
        cart[i].qty++;
        saveCart();
        render();
      });
    });
    cartItemsList.querySelectorAll('.item-remove').forEach(btn => {
      btn.addEventListener('click', () => removeItem(+btn.dataset.idx));
    });

    // ── Summary sidebar ──
    if (summaryLines) {
      summaryLines.innerHTML = '';
      cart.forEach(item => {
        const line = document.createElement('div');
        line.className = 'summary-line';
        line.innerHTML = `
          <div class="summary-line__img">
            <img src="${esc(item.img)}" alt="${esc(item.name)}" loading="lazy">
          </div>
          <div class="summary-line__info">
            <p class="summary-line__name">${esc(item.name)}</p>
            <p class="summary-line__meta">Qty ${item.qty}</p>
          </div>
          <span class="summary-line__total">$${item.price * item.qty}</span>
        `;
        summaryLines.appendChild(line);
      });
    }

    const total = calcTotal();
    if (summarySubtotal) summarySubtotal.textContent = '$' + total;
    if (summaryShipping) {
      summaryShipping.textContent = total >= 200 ? 'Free' : '$15';
      summaryShipping.className   = total >= 200 ? 'summary-free' : '';
    }
    if (summaryTotal) {
      const shipping = total >= 200 ? 0 : (total === 0 ? 0 : 15);
      summaryTotal.textContent = '$' + (total + shipping);
    }

    // Refresh WhatsApp link
    refreshWhatsAppLink();
  }

  /* ──────────────────────────────────────────────────────────────
     REMOVE ITEM (with animation)
  ────────────────────────────────────────────────────────────── */
  function removeItem (idx) {
    const rows = cartItemsList.querySelectorAll('.cart-item');
    const row  = rows[idx];
    const name = cart[idx] ? cart[idx].name : '';

    if (row) {
      row.classList.add('removing');
      row.addEventListener('animationend', () => {
        cart.splice(idx, 1);
        saveCart();
        render();
        if (name) showToast(name + ' removed');
      }, { once: true });
    } else {
      cart.splice(idx, 1);
      saveCart();
      render();
    }
  }

  /* ──────────────────────────────────────────────────────────────
     NORMALISE LEGACY CART DATA
     Old cart entries may lack qty / cat / conc — fill defaults
  ────────────────────────────────────────────────────────────── */
  cart = cart.map(item => ({
    name:  item.name   || 'Unknown',
    price: +item.price || 0,
    img:   item.img    || item.image || '',
    cat:   item.cat    || 'Fragrance',
    conc:  item.conc   || 'Eau de Parfum',
    qty:   item.qty    || 1
  }));

  // Merge duplicate names
  const merged = [];
  cart.forEach(item => {
    const existing = merged.find(m => m.name === item.name);
    if (existing) {
      existing.qty += item.qty;
      if (!existing.img && item.img) existing.img = item.img;
    } else {
      merged.push({ ...item });
    }
  });
  cart = merged;
  saveCart();

  /* ──────────────────────────────────────────────────────────────
     CUSTOM CURSOR
  ────────────────────────────────────────────────────────────── */
  if (cursorDot && cursorRing && window.matchMedia('(pointer:fine)').matches) {
    let mx = -200, my = -200, rx = -200, ry = -200;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.addEventListener('mouseover', e => {
      if (e.target.closest('button, a, select')) cursorRing.classList.add('is-big');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest('button, a, select')) cursorRing.classList.remove('is-big');
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
     INIT
  ────────────────────────────────────────────────────────────── */
  render();

  /* ──────────────────────────────────────────────────────────────
     CROSS-PAGE CART SYNC (tabs)
  ────────────────────────────────────────────────────────────── */
  window.addEventListener('storage', e => {
    if (e.key === 'lumiere_cart') {
      try { cart = JSON.parse(e.newValue || '[]'); } catch (_) { cart = []; }
      render();
    }
  });

})();