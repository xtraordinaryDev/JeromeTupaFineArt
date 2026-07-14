// Quote marquee — motion is pure CSS. This module only duplicates the
// track for a seamless loop and pauses the animation while off-screen.

document.querySelectorAll('.marquee').forEach((m) => {
  const track = m.querySelector('.marquee__track');
  if (!track) return;
  // Duplicate items until the track is at least 2x the viewport width,
  // then clone the whole set once more so translateX(-50%) loops cleanly.
  const original = track.innerHTML;
  while (track.scrollWidth < window.innerWidth * 1.2 && track.children.length < 20) {
    track.insertAdjacentHTML('beforeend', original);
  }
  track.insertAdjacentHTML('beforeend', track.innerHTML);
  track.querySelectorAll('.marquee__item:not(:first-child)')
    .forEach((el) => el.setAttribute('aria-hidden', 'true'));

  const io = new IntersectionObserver(([e]) => {
    track.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
  });
  io.observe(m);
});
