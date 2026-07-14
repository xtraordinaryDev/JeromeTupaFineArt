// Drag-to-scroll for horizontal rails (desktop pointer-fine only).
// Touch devices already scroll natively with scroll-snap.

const fine = matchMedia('(pointer: fine)');

export function initRails(root = document) {
  if (!fine.matches) return;
  root.querySelectorAll('.rail').forEach((rail) => {
    let startX = 0, startScroll = 0, dragging = false, moved = false;

    rail.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true; moved = false;
      startX = e.clientX;
      startScroll = rail.scrollLeft;
    });
    rail.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4 && !moved) {
        moved = true;
        rail.classList.add('is-dragging');
        rail.setPointerCapture(e.pointerId);
      }
      if (moved) rail.scrollLeft = startScroll - dx;
    });
    const end = () => {
      dragging = false;
      rail.classList.remove('is-dragging');
    };
    rail.addEventListener('pointerup', end);
    rail.addEventListener('pointercancel', end);
    // Suppress the click that follows a drag so cards don't navigate.
    rail.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
  });
}

initRails();
