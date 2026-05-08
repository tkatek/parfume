/**
 * IKIRA — Full Collection Page JS
 * Handles: filter animations, sort, entrance animations
 */

'use strict';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════
   COLLECTION FILTER + SORT
═══════════════════════════════════════════════════════════ */
const CollectionPage = (() => {
  const grid        = document.getElementById('fullCollGrid');
  const countEl     = document.getElementById('collCount');
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const sortSelect  = document.getElementById('sortSelect');

  let activeFilter  = 'all';
  let activeSort    = 'default';

  // Get all cards as array
  const getAllCards = () => Array.from(document.querySelectorAll('.full-coll-card'));

  // ── Filter ──
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilterAndSort();
    });
  });

  // ── Sort ──
  sortSelect?.addEventListener('change', () => {
    activeSort = sortSelect.value;
    applyFilterAndSort();
  });

  // ── Apply ──
  function applyFilterAndSort() {
    const cards = getAllCards();

    // Step 1: Determine which cards match filter
    const matching = cards.filter(c => {
      const cat = c.dataset.category;
      return activeFilter === 'all' || cat === activeFilter;
    });

    const rejected = cards.filter(c => !matching.includes(c));

    // Step 2: Animate out rejected
    if (rejected.length) {
      gsap.to(rejected, {
        opacity: 0,
        scale: 0.88,
        duration: 0.25,
        ease: 'power2.in',
        stagger: 0.03,
        onComplete: () => {
          rejected.forEach(c => { c.classList.add('filtered-out'); });
          rearrangeAndAnimate(matching);
          updateCount(matching.length);
        }
      });
    } else {
      rearrangeAndAnimate(matching);
      updateCount(matching.length);
    }
  }

  function rearrangeAndAnimate(cards) {
    // Sort
    const sorted = sortCards([...cards], activeSort);

    // Show and re-order in DOM
    sorted.forEach((card, i) => {
      card.classList.remove('filtered-out');
      card.style.order = i;
    });

    // Animate in
    gsap.fromTo(sorted,
      { opacity: 0, y: 28, scale: 0.94 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.5,
        ease: 'power3.out',
        stagger: { amount: 0.3, from: 'start' }
      }
    );
  }

  function sortCards(cards, method) {
    switch (method) {
      case 'price-asc':
        return cards.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
      case 'price-desc':
        return cards.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
      case 'name':
        return cards.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
      default:
        return cards; // Original DOM order
    }
  }

  function updateCount(n) {
    if (countEl) countEl.textContent = `${n} product${n !== 1 ? 's' : ''}`;
  }

  // ── Entrance Animations ──
  function initEntrance() {
    // Hero
    const heroTl = gsap.timeline({ delay: 0.1 });
    heroTl
      .from('.coll-hero__title', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out' })
      .from('.coll-hero__sub',   { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .from('.coll-hero__img',   { opacity: 0, x: 40, scale: 0.96, duration: 1, ease: 'power3.out' }, '-=0.7');

    // Toolbar
    gsap.from('.coll-toolbar', {
      opacity: 0, y: -10,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.4
    });

    // Grid cards
    ScrollTrigger.batch('.full-coll-card', {
      onEnter: (els) => {
        gsap.fromTo(els,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.65, stagger: 0.07, ease: 'power3.out' }
        );
      },
      start: 'top 90%',
      once: true
    });
  }

  // ── Init ──
  initEntrance();
})();