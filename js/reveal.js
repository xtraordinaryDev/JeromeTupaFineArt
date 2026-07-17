// One IntersectionObserver for every .reveal / .curtain on the site.
// Stagger: a parent with [data-stagger] assigns each revealing child an
// incremental --reveal-delay.
// Classic script (no modules) so it runs from file:// and any static host.

window.Tupa = window.Tupa || {};

(function () {
  'use strict';

  // Flag that JS is genuinely running. motion.css keys its hidden initial
  // states on .js, so if scripts don't execute the content renders visible.
  document.documentElement.classList.replace('no-js', 'js');

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '-10% 0px' });

  Tupa.observeReveals = function (root) {
    root = root || document;
    root.querySelectorAll('[data-stagger]').forEach((parent) => {
      const step = parseFloat(parent.dataset.stagger) || 0.08;
      parent.querySelectorAll('.reveal, .curtain').forEach((el, i) => {
        el.style.setProperty('--reveal-delay', `${(i % 12) * step}s`);
      });
    });
    root.querySelectorAll('.reveal, .curtain').forEach((el) => {
      if (!el.classList.contains('is-visible')) io.observe(el);
    });
  };

  Tupa.observeReveals();
})();
