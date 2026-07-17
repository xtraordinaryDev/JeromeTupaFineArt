// Artist page — scroll-driven quote build + Tupa works grid.
// Classic script; requires data/lots.js, js/data.js, js/reveal.js.

(function () {
  'use strict';

  /* Pilgrimage quote: tall section with a sticky inner panel; lines light
     up as scroll progresses through the section. */
  const pin = document.querySelector('.quote-pin');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  if (pin && !reduced.matches) {
    const lines = Array.from(
      pin.querySelectorAll('.quote-pin__line, .quote-pin__sig, .quote-pin__attr'));
    const update = () => {
      const r = pin.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -r.top / total));
      const lit = Math.floor(progress * (lines.length + 0.5));
      lines.forEach((el, i) => el.classList.toggle('is-lit', i < lit));
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  } else if (pin) {
    pin.querySelectorAll('.quote-pin__line, .quote-pin__sig, .quote-pin__attr')
      .forEach((el) => el.classList.add('is-lit'));
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
