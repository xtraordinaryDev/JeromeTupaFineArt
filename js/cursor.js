// Custom cursor — desktop pointer-fine only, disabled under reduced motion.
// Classic script.

(function () {
  'use strict';

  const fine = matchMedia('(pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || reduced.matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot is-hidden';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  document.body.classList.add('has-custom-cursor');

  let tx = -100, ty = -100, x = -100, y = -100;

  document.addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    dot.classList.remove('is-hidden');
    const target = e.target.closest ? e.target.closest('[data-cursor]') : null;
    if (target) {
      dot.classList.add('is-label');
      dot.textContent = target.dataset.cursor;
    } else {
      dot.classList.remove('is-label');
      dot.textContent = '';
    }
  }, { passive: true });

  document.addEventListener('pointerleave', () => dot.classList.add('is-hidden'));

  (function loop() {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(loop);
  })();
})();
