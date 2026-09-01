// Artist page — pilgrimage quote reveal + Tupa works grid.
// Classic script; requires data/lots.js, js/data.js, js/reveal.js.

(function () {
  'use strict';

  /* Pilgrimage quote: every line lights together the first time the panel
     scrolls into view — no scroll-driven build. */
  const pin = document.querySelector('.quote-pin');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  if (pin) {
    const light = () => pin.classList.add('is-lit');
    if (reduced.matches || !('IntersectionObserver' in window)) {
      light();
    } else {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { light(); io.disconnect(); }
      }, { threshold: 0.3 });
      io.observe(pin.querySelector('.quote-pin__panel') || pin);
    }
  }

  /* Works by Tupa */
  const grid = document.querySelector('[data-artist-grid]');
  if (grid) {
    Tupa.getLots().then((lots) => {
      lots.filter((l) => l.category === 'tupa')
        .forEach((lot) => grid.appendChild(Tupa.buildLotCard(lot)));
      Tupa.observeReveals(grid.parentElement);
    }).catch(() => {
      const section = grid.closest('section');
      if (section) section.remove();
    });
  }
})();
