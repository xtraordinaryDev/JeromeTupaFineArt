// Quote marquee — motion is pure CSS. This script only duplicates the
// track for a seamless loop and pauses the animation while off-screen.
// Classic script.

(function () {
  'use strict';

  document.querySelectorAll('.marquee').forEach((m) => {
    const track = m.querySelector('.marquee__track');
    if (!track) return;
    const original = track.innerHTML;
    while (track.scrollWidth < window.innerWidth * 1.2 && track.children.length < 20) {
      track.insertAdjacentHTML('beforeend', original);
    }
    track.insertAdjacentHTML('beforeend', track.innerHTML);
    track.querySelectorAll('.marquee__item:not(:first-child)')
      .forEach((el) => el.setAttribute('aria-hidden', 'true'));

    const io = new IntersectionObserver((entries) => {
      track.style.animationPlayState = entries[0].isIntersecting ? 'running' : 'paused';
    });
    io.observe(m);
  });
})();
