// One IntersectionObserver for every .reveal / .curtain on the site.
// Stagger: a parent with [data-stagger] assigns each revealing child an
// incremental --reveal-delay.

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { rootMargin: '-10% 0px' });

export function observeReveals(root = document) {
  root.querySelectorAll('[data-stagger]').forEach((parent) => {
    const step = parseFloat(parent.dataset.stagger) || 0.08;
    parent.querySelectorAll('.reveal, .curtain').forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${(i % 12) * step}s`);
    });
  });
  root.querySelectorAll('.reveal, .curtain').forEach((el) => {
    if (!el.classList.contains('is-visible')) io.observe(el);
  });
}

observeReveals();
