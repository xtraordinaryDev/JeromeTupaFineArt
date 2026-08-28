// Quote marquee — motion is pure CSS. This script duplicates the track for a
// seamless loop, paces the scroll to the track length, and pauses the
// animation while off-screen. Classic script.

(function () {
  'use strict';

  // Pacing by distance rather than a fixed duration keeps the scroll speed
  // steady no matter how many quotes are in rotation. Roughly half a minute
  // per quote, so the full set turns over in about two.
  const PX_PER_SECOND = 60;

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

    // The keyframe travels half the track, so pace against that distance.
    const distance = track.scrollWidth / 2;
    if (distance > 0) {
      track.style.animationDuration = Math.round(distance / PX_PER_SECOND) + 's';
    }

    const io = new IntersectionObserver((entries) => {
      track.style.animationPlayState = entries[0].isIntersecting ? 'running' : 'paused';
    });
    io.observe(m);
  });
})();
