// Lot detail — renders from lots.json via ?lot= URL param.
// Deep zoom is hand-rolled (wheel + drag + pinch) to stay dependency-free;
// swap for @panzoom/panzoom via CDN if richer gestures are ever needed.

import { getLots, formatEstimate, lotNumberLabel, altText, buildLotCard } from './data.js';
import { observeReveals } from './reveal.js';
import { initRails } from './rail.js';

const $ = (sel) => document.querySelector(sel);
const params = new URLSearchParams(location.search);
const lotId = params.get('lot');

/* Wall asset real-world scale contract — see scripts/generate-art.mjs */
const WALL = { imgW: 1600, imgH: 1000, wallInches: 160, floorFromTopIn: 80, eyeHeightIn: 57 };

getLots().then((lots) => {
  const lot = lots.find((l) => l.id === lotId || String(l.lotNumber) === lotId);
  if (!lot) return showMissing();
  render(lot, lots);
}).catch(showMissing);

function showMissing() {
  $('.lot-page').innerHTML = `
    <div class="lot-missing">
      <h1 class="display">Lot not found.</h1>
      <p>The lot you're looking for isn't in this sale.</p>
      <p style="margin-top:2rem"><a class="btn btn--ink" href="auction.html">Browse the catalogue</a></p>
    </div>`;
}

function render(lot, lots) {
  document.title = `${lotNumberLabel(lot)} · ${lot.title} — Father Jerome Tupa Auction`;

  $('[data-lot-number]').textContent = lotNumberLabel(lot);
  $('[data-lot-artist]').textContent = lot.artist;
  $('[data-lot-title]').textContent = lot.title;
  $('[data-lot-estimate]').textContent = formatEstimate(lot);
  $('[data-bar-estimate]').textContent = formatEstimate(lot);

  /* Specs list */
  const specs = $('[data-lot-specs]');
  const dims = `<span data-dims>${lot.dimensionsIn}</span><button type="button" class="unit-toggle" data-unit-toggle aria-label="Show dimensions in centimeters">cm</button>`;
  const rows = [
    ['Year', lot.year ?? 'To be announced'],
    ['Medium', lot.medium],
    ['Dimensions', dims],
    ['Provenance', lot.provenance || 'Available on request'],
  ];
  specs.innerHTML = rows.map(([dt, dd]) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`).join('');

  /* in ⇄ cm toggle */
  let metric = false;
  specs.querySelector('[data-unit-toggle]').addEventListener('click', (e) => {
    metric = !metric;
    specs.querySelector('[data-dims]').textContent = metric ? lot.dimensionsCm : lot.dimensionsIn;
    e.target.textContent = metric ? 'in' : 'cm';
    e.target.setAttribute('aria-label', metric ? 'Show dimensions in inches' : 'Show dimensions in centimeters');
  });

  /* Essay + provenance */
  $('[data-lot-essay]').textContent = lot.essay || 'A full catalogue note for this lot will be available at the evening sale.';
  $('[data-lot-provenance]').textContent = lot.provenance || 'Provenance details available on request.';

  /* Condition report mailto */
  const cr = $('[data-condition-link]');
  cr.href = `mailto:info@jerometupafineart.com?subject=${encodeURIComponent(`Condition report request — ${lotNumberLabel(lot)}: ${lot.title}`)}`;

  /* Register to bid (TODO: real registration mechanics pending client) */
  $('[data-register]').href = 'event.html#rsvp';
  $('[data-bar-register]').href = 'event.html#rsvp';

  initStage(lot);
  initHeart(lot);
  initShare(lot);
  injectSchema(lot);
  renderMoreRail(lot, lots);
  document.body.classList.add('has-lot-bar');
}

/* ------------------------------------------------- Image stage + zoom */

function initStage(lot) {
  const stage = $('.lot-stage');
  const img = $('[data-lot-image]');
  const thumbs = $('.lot-thumbs');
  const hint = $('.lot-stage__hint');
  let roomMode = false;
  let currentSrc = lot.images[0] || null;

  if (!currentSrc) {
    stage.innerHTML = `<div class="lot-placeholder">${lot.artist === 'Pablo Picasso' ? 'Picasso' : lot.title}</div>`;
    $('.room-toggle')?.remove();
    return;
  }
  img.src = currentSrc;
  img.alt = altText(lot);

  /* Thumbnails */
  lot.images.forEach((src, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = i === 0 ? 'is-active' : '';
    b.setAttribute('aria-label', `View image ${i + 1} of ${lot.images.length}`);
    b.innerHTML = `<img src="${src}" alt="" loading="lazy" width="76" height="76">`;
    b.addEventListener('click', () => {
      currentSrc = src;
      img.src = src;
      thumbs.querySelectorAll('button:not(.room-toggle)').forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      resetZoom();
      if (roomMode) placeInRoom();
    });
    thumbs.insertBefore(b, thumbs.querySelector('.room-toggle'));
  });

  /* Zoom / pan state */
  let scale = 1, tx = 0, ty = 0;
  const MAX = 5;

  function apply() {
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    stage.classList.toggle('is-zoomed', scale > 1);
    hint.hidden = scale > 1 || roomMode;
  }
  function resetZoom() {
    scale = 1; tx = 0; ty = 0;
    img.style.transform = '';
    stage.classList.remove('is-zoomed');
    hint.hidden = roomMode;
  }

  function zoomAt(cx, cy, factor) {
    const next = Math.min(MAX, Math.max(1, scale * factor));
    const r = img.getBoundingClientRect();
    const ox = cx - r.left, oy = cy - r.top;
    tx += ox * (1 - next / scale);
    ty += oy * (1 - next / scale);
    scale = next;
    if (scale === 1) { tx = 0; ty = 0; }
    apply();
  }

  stage.addEventListener('wheel', (e) => {
    if (roomMode) return;
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 1 / 1.15);
  }, { passive: false });

  stage.addEventListener('dblclick', (e) => {
    if (roomMode) return;
    if (scale > 1) resetZoom();
    else zoomAt(e.clientX, e.clientY, 2.5);
  });

  /* Drag pan + two-pointer pinch */
  const pointers = new Map();
  let lastDist = 0;
  stage.addEventListener('pointerdown', (e) => {
    if (roomMode) return;
    pointers.set(e.pointerId, e);
    stage.setPointerCapture(e.pointerId);
    if (scale > 1) stage.classList.add('is-panning');
  });
  stage.addEventListener('pointermove', (e) => {
    if (roomMode || !pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, e);
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (lastDist) {
        zoomAt((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2, dist / lastDist);
      }
      lastDist = dist;
    } else if (scale > 1) {
      tx += e.clientX - prev.clientX;
      ty += e.clientY - prev.clientY;
      apply();
    }
  });
  const release = (e) => {
    pointers.delete(e.pointerId);
    lastDist = 0;
    stage.classList.remove('is-panning');
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  /* Room view — true relative scale from the artwork's real dimensions */
  function placeInRoom() {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const cover = Math.max(sw / WALL.imgW, sh / WALL.imgH);
    const ppi = (WALL.imgW / WALL.wallInches) * cover; // rendered px per inch
    const offX = (sw - WALL.imgW * cover) / 2;
    const offY = (sh - WALL.imgH * cover) / 2;
    const w = lot.widthIn * ppi;
    const h = lot.heightIn * ppi;
    // wall/floor junction, in stage pixels (asset is 10 px per inch):
    const junction = offY + WALL.floorFromTopIn * (WALL.imgW / WALL.wallInches) * cover;
    const centerY = junction - WALL.eyeHeightIn * ppi; // artwork centered at 57in eye height
    img.style.width = `${w}px`;
    img.style.height = `${h}px`;
    img.style.left = `${(sw - w) / 2}px`;
    img.style.top = `${centerY - h / 2}px`;
  }

  const roomBtn = $('.room-toggle');
  roomBtn.addEventListener('click', () => {
    roomMode = !roomMode;
    roomBtn.setAttribute('aria-pressed', String(roomMode));
    resetZoom();
    stage.classList.toggle('lot-stage--room', roomMode);
    if (roomMode) {
      placeInRoom();
    } else {
      img.style.width = img.style.height = img.style.left = img.style.top = '';
    }
    hint.hidden = roomMode;
  });
  window.addEventListener('resize', () => { if (roomMode) placeInRoom(); });
}

/* -------------------------------------------------- My list (heart) */

function initHeart(lot) {
  const KEY = 'tupa-my-list';
  const btn = $('[data-heart]');
  const read = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const saved = () => read().includes(lot.id);
  const sync = () => {
    btn.setAttribute('aria-pressed', String(saved()));
    btn.setAttribute('aria-label', saved() ? 'Remove from my list' : 'Add to my list');
  };
  btn.addEventListener('click', () => {
    const list = read();
    const i = list.indexOf(lot.id);
    if (i >= 0) list.splice(i, 1); else list.push(lot.id);
    localStorage.setItem(KEY, JSON.stringify(list));
    sync();
  });
  sync();
}

/* -------------------------------------------------------------- Share */

function initShare(lot) {
  const btn = $('[data-share]');
  btn.addEventListener('click', async () => {
    const data = {
      title: `${lotNumberLabel(lot)} — ${lot.title}`,
      text: `${lot.artist}, ${lot.title} — An Evening of Fine Art & Philanthropy, October 22, 2026`,
      url: location.href,
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch { /* user dismissed */ }
    } else {
      await navigator.clipboard.writeText(location.href);
      const old = btn.textContent;
      btn.textContent = 'Link copied';
      setTimeout(() => { btn.textContent = old; }, 2000);
    }
  });
}

/* ----------------------------------------------------------- Schema */

function injectSchema(lot) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: lot.title,
    creator: { '@type': 'Person', name: lot.artist },
    artMedium: lot.medium,
    width: { '@type': 'Distance', name: `${lot.widthIn} in` },
    height: { '@type': 'Distance', name: `${lot.heightIn} in` },
    ...(lot.year ? { dateCreated: String(lot.year) } : {}),
    ...(lot.images.length ? { image: new URL(lot.images[0], location.href).href } : {}),
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(schema);
  document.head.appendChild(s);
}

/* -------------------------------------------- More from this sale */

function renderMoreRail(lot, lots) {
  const rail = $('[data-more-rail]');
  const same = lots.filter((l) => l.id !== lot.id && l.category === lot.category);
  const rest = lots.filter((l) => l.id !== lot.id && l.category !== lot.category);
  const picks = [...same, ...rest].slice(0, 6);
  picks.forEach((l) => rail.appendChild(buildLotCard(l)));
  observeReveals(rail.parentElement);
  initRails(rail.parentElement);
}
