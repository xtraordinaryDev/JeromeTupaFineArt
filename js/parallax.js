// Hero band parallax — elements with [data-parallax="rate"] translate at
// (rate − 1) × scrollY. Classic script.

(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const els = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!els.length || reduced.matches) return;

  let ticking = false;
  function update() {
    const y = window.scrollY;
    els.forEach((el) => {
      const rate = parseFloat(el.dataset.parallax) || 1;
      el.style.transform = `translateY(${y * (rate - 1)}px)`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
