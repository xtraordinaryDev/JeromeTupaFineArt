// The printed invitation — a focus-trapped overlay that opens like the
// physical mailer: envelope, then the 7×7 card, then the zig-zag booklet.
// The homepage trigger is a plain link to the card PDF, so it still works
// without this script. Classic script.

(function () {
  'use strict';

  const viewer = document.getElementById('invitation-viewer');
  const opener = document.querySelector('.invite-opener');
  if (!viewer || !opener) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TITLE = {
    envelope: 'The Envelope',
    card: 'The Invitation',
    booklet: 'The Booklet',
  };
  const FLIP_LABELS = { front: 'Turn the card over', back: 'Back to the front' };
  const SIDE_LABELS = { a: 'Turn the booklet over', b: 'Back to the first folds' };
  const N = 6;

  const titleEl = document.getElementById('invite-viewer-title');
  const flip = viewer.querySelector('[data-invite-flip]');
  const unfold = viewer.querySelector('[data-invite-unfold]');
  const drawBtns = viewer.querySelectorAll('[data-invite-draw]');
  const closers = viewer.querySelectorAll('[data-invite-close]');
  const sideFlip = viewer.querySelector('[data-zigzag-flip]');
  const prevBtn = viewer.querySelector('[data-zigzag-prev]');
  const nextBtn = viewer.querySelector('[data-zigzag-next]');
  const countEl = viewer.querySelector('[data-zigzag-count]');
  const zigzag = viewer.querySelector('[data-zigzag]');
  const prevArrow = viewer.querySelector('[data-invite-prev]');
  const nextArrow = viewer.querySelector('[data-invite-next]');

  let lastFocused = null;
  let stage = 'envelope';
  let side = 'a';
  let index = 0;
  let drawTimer = null;

  function focusables() {
    return Array.from(viewer.querySelectorAll(
      'a[href], button:not([disabled]):not([hidden])'
    )).filter((el) => el.offsetParent !== null || el === viewer.querySelector('.invite-viewer__close'));
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      advance(e.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    if (e.key !== 'Tab') return;
    const els = focusables();
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function setFace(showBack) {
    viewer.classList.toggle('is-flipped', showBack);
    if (!flip) return;
    flip.setAttribute('aria-pressed', String(showBack));
    flip.textContent = showBack ? FLIP_LABELS.back : FLIP_LABELS.front;
    syncArrows();
  }

  function strip() {
    return viewer.querySelector(`[data-zigzag-side="${side}"]`);
  }

  function renderZigzag() {
    const el = strip();
    if (!el) return;
    el.style.setProperty('--i', String(index));
    el.querySelectorAll('.zigzag__panel').forEach((p, i) => {
      p.classList.toggle('is-current', i === index);
    });
    if (countEl) countEl.textContent = `${index + 1} / ${N}`;
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === N - 1;
    if (sideFlip) sideFlip.textContent = SIDE_LABELS[side];
    syncArrows();
  }

  function showSide(next) {
    side = next;
    viewer.querySelectorAll('[data-zigzag-side]').forEach((el) => {
      el.hidden = el.dataset.zigzagSide !== side;
    });
    index = 0;
    renderZigzag();
  }

  function step(dir) {
    const next = Math.min(N - 1, Math.max(0, index + dir));
    if (next === index) return;
    index = next;
    renderZigzag();
  }

  function setStage(name) {
    stage = name;
    viewer.dataset.stage = name;
    if (titleEl) titleEl.textContent = TITLE[name];
    viewer.querySelectorAll('[data-stage-panel]').forEach((el) => {
      el.hidden = el.dataset.stagePanel !== name;
    });
    drawBtns.forEach((b) => { b.hidden = name !== 'envelope'; });
    if (flip) flip.hidden = name !== 'card';
    if (unfold) unfold.hidden = name !== 'card';
    if (sideFlip) sideFlip.hidden = name !== 'booklet';
    if (name === 'card') {
      setFace(false);
      requestAnimationFrame(() => { if (flip) flip.focus(); });
    }
    if (name === 'booklet') {
      showSide('a');
      requestAnimationFrame(() => { if (nextBtn) nextBtn.focus(); });
    }
    syncArrows();
  }

  /* Floating step arrows: one linear sequence through the whole mailer —
     envelope → card front → card back → booklet folds (side a, then b). */
  function canStep(dir) {
    if (stage === 'envelope') return dir > 0;
    if (stage === 'card') return true;
    return dir < 0 || !(side === 'b' && index === N - 1);
  }

  function syncArrows() {
    if (prevArrow) prevArrow.disabled = !canStep(-1);
    if (nextArrow) nextArrow.disabled = !canStep(1);
  }

  function advance(dir) {
    if (!canStep(dir)) return;
    const arrow = dir > 0 ? nextArrow : prevArrow;
    const keepFocus = document.activeElement === arrow;
    if (stage === 'envelope') {
      drawCard();
    } else if (stage === 'card') {
      const onBack = viewer.classList.contains('is-flipped');
      if (dir > 0) {
        if (onBack) openBooklet(); else setFace(true);
      } else if (onBack) {
        setFace(false);
      } else {
        clearTimeout(drawTimer);
        viewer.classList.remove('is-unsealing');
        setStage('envelope');
      }
    } else if (dir > 0) {
      if (index < N - 1) step(1); else showSide('b');
    } else if (index > 0) {
      step(-1);
    } else if (side === 'b') {
      showSide('a');
      index = N - 1;
      renderZigzag();
    } else {
      setStage('card');
      setFace(true);
    }
    if (keepFocus) {
      // setStage moves focus to the stage's own button; give it back to the
      // arrow the guest is clicking so they can keep stepping.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (arrow && !arrow.disabled) arrow.focus();
      }));
    }
  }

  function drawCard() {
    clearTimeout(drawTimer);
    viewer.classList.add('is-unsealing');
    const go = () => setStage('card');
    if (reduceMotion) { go(); return; }
    drawTimer = setTimeout(go, 900);
  }

  function openBooklet() {
    setStage('booklet');
  }

  function open() {
    lastFocused = document.activeElement;
    clearTimeout(drawTimer);
    viewer.classList.remove('is-unsealing', 'is-flipped');
    setFace(false);
    viewer.hidden = false;
    if (reduceMotion) {
      setStage('card');
    } else {
      setStage('envelope');
    }
    requestAnimationFrame(() => {
      viewer.classList.add('is-open');
      if (!reduceMotion) {
        // The flap lifts on its own so the overlay feels like mail arriving;
        // a click still skips ahead for anyone who doesn't want to wait.
        requestAnimationFrame(() => viewer.classList.add('is-unsealing'));
        drawTimer = setTimeout(() => setStage('card'), 1400);
      }
    });
    document.body.classList.add('overlay-open');
    opener.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onKeydown);
  }

  function close() {
    clearTimeout(drawTimer);
    viewer.classList.remove('is-open', 'is-unsealing');
    document.body.classList.remove('overlay-open');
    opener.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onKeydown);

    const inner = viewer.querySelector('.invite-viewer__inner');
    const done = () => {
      viewer.hidden = true;
      setStage('envelope');
      setFace(false);
    };
    if (inner && getComputedStyle(inner).transitionDuration !== '0s') {
      inner.addEventListener('transitionend', done, { once: true });
      setTimeout(done, 700);
    } else {
      done();
    }
    if (lastFocused) lastFocused.focus();
  }

  opener.setAttribute('aria-expanded', 'false');
  opener.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    open();
  });
  closers.forEach((el) => el.addEventListener('click', close));
  drawBtns.forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    drawCard();
  }));
  if (flip) {
    flip.addEventListener('click', () => {
      setFace(!viewer.classList.contains('is-flipped'));
    });
  }
  if (unfold) unfold.addEventListener('click', openBooklet);
  if (prevArrow) prevArrow.addEventListener('click', () => advance(-1));
  if (nextArrow) nextArrow.addEventListener('click', () => advance(1));
  if (prevBtn) prevBtn.addEventListener('click', () => step(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => step(1));
  if (sideFlip) {
    sideFlip.addEventListener('click', () => showSide(side === 'a' ? 'b' : 'a'));
  }

  const viewport = viewer.querySelector('.zigzag__viewport');
  let pointerX = null;
  if (viewport) {
    viewport.addEventListener('pointerdown', (e) => { pointerX = e.clientX; });
    viewport.addEventListener('pointerup', (e) => {
      if (pointerX == null || stage !== 'booklet') return;
      const dx = e.clientX - pointerX;
      pointerX = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });
    viewport.addEventListener('pointercancel', () => { pointerX = null; });
  }
})();
