// Parallax — two modes:
//   [data-parallax="rate"]     page-scroll bands (hero overlays)
//   [data-parallax-bg="amt"]   mid-page photos that drift inside overflow:clip
// Classic script.

(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;

  const bands = Array.from(document.querySelectorAll('[data-parallax]'));
  const bgs = Array.from(document.querySelectorAll('[data-parallax-bg]'));
  if (!bands.length && !bgs.length) return;

  let ticking = false;

  function update() {
    const y = window.scrollY;
    const viewH = window.innerHeight;

    bands.forEach((el) => {
      const rate = parseFloat(el.dataset.parallax) || 1;
      el.style.transform = `translate3d(0, ${y * (rate - 1)}px, 0)`;
    });

    bgs.forEach((el) => {
      const section = el.closest('section') || el.parentElement;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      // Clamp so off-screen sections don't get extreme offsets
      const raw = (viewH - rect.top) / (viewH + rect.height);
      const progress = Math.min(1, Math.max(0, raw));
      const amt = parseFloat(el.dataset.parallaxBg) || 40;
      const offset = (progress - 0.5) * amt;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
