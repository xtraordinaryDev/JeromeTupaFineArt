// Lot detail — renders from the embedded lot data via ?lot= URL param.
// Deep zoom is hand-rolled (wheel + drag + pinch) to stay dependency-free;
// swap for @panzoom/panzoom via CDN if richer gestures are ever needed.
// Classic script; requires data/lots.js, js/data.js, js/reveal.js, js/rail.js.

(function () {
'use strict';

const getLots = Tupa.getLots;
const lotNumberLabel = Tupa.lotNumberLabel;
const altText = Tupa.altText;
const buildLotCard = Tupa.buildLotCard;
const observeReveals = Tupa.observeReveals;
const initRails = Tupa.initRails;

const $ = (sel) => document.querySelector(sel);
const params = new URLSearchParams(location.search);
const lotId = params.get('lot');

/* Wall asset real-world scale contract — see scripts/generate-art.mjs */
const WALL = {
  imgW: 1600, imgH: 1000, wallInches: 160, floorFromTopIn: 80, eyeHeightIn: 57,
  benchHeightIn: 18, benchWidthIn: 62, // bench drawn in wall.svg: 62in wide, 18in seat
  benchGapIn: 4,       // hung work stays at least this far above the bench
  minObjectFrac: 0.3,  // pottery on the bench is never shorter than 30% of the stage
};

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
  $('[data-lot-artist]').textContent = '';
  Tupa.appendWithBibleItalics($('[data-lot-artist]'), lot.artist);
  $('[data-lot-title]').textContent = '';
  Tupa.appendWithBibleItalics($('[data-lot-title]'), lot.title);

  /* Specs list */
  const specs = $('[data-lot-specs]');
  specs.textContent = '';
  const addSpec = (label, value, html, stacked) => {
    const wrap = document.createElement('div');
    if (stacked) wrap.className = 'is-stacked';
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    if (html) dd.innerHTML = value;
    else Tupa.appendWithBibleItalics(dd, value);
    wrap.append(dt, dd);
    specs.appendChild(wrap);
  };
  const dims = `<span data-dims>${lot.dimensionsIn}</span><button type="button" class="unit-toggle" data-unit-toggle aria-label="Show dimensions in centimeters">cm</button>`;
  addSpec('Auction', Tupa.SALE_LABELS[lot.sale] || 'Live Auction');
  addSpec('Year', String(lot.year ?? 'To be announced'));
  addSpec('Medium', lot.medium);
  addSpec('Dimensions', dims, true);
  if (lot.includes) addSpec('Includes', lot.includes, true, true);
  if (lot.catalogueRefs) addSpec('Catalogue', lot.catalogueRefs);
  if (lot.inscription) addSpec('Inscription', lot.inscription, false, true);
  addSpec('Provenance', lot.provenance || 'Available on request');

  /* in ⇄ cm toggle */
  let metric = false;
  specs.querySelector('[data-unit-toggle]').addEventListener('click', (e) => {
    metric = !metric;
    specs.querySelector('[data-dims]').textContent = metric ? lot.dimensionsCm : lot.dimensionsIn;
    e.target.textContent = metric ? 'in' : 'cm';
    e.target.setAttribute('aria-label', metric ? 'Show dimensions in inches' : 'Show dimensions in centimeters');
  });

  /* Essay + provenance — blank lines in the catalogue copy become paragraphs */
  const essay = $('[data-lot-essay]');
  essay.textContent = '';
  (lot.essay || 'A full catalogue note for this lot will be available at the evening sale.')
    .split('\n\n')
    .forEach((para) => {
      const p = document.createElement('p');
      Tupa.appendWithBibleItalics(p, para);
      essay.appendChild(p);
    });
  const provenanceEl = $('[data-lot-provenance]');
  provenanceEl.textContent = '';
  Tupa.appendWithBibleItalics(provenanceEl, lot.provenance || 'Provenance details available on request.');

  /* Condition report mailto */
  const cr = $('[data-condition-link]');
  cr.href = `mailto:John@JohnPellegrene.com?subject=${encodeURIComponent(`Condition report request — ${lotNumberLabel(lot)}: ${lot.title}`)}`;

  initStage(lot);
  initFilms(lot);
  initHeart(lot);
  initShare(lot);
  injectSchema(lot);
  renderMoreRail(lot, lots);
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
    const ph = document.createElement('div');
    ph.className = 'lot-placeholder';
    if (lot.artist === 'Pablo Picasso' || String(lot.artist).startsWith('Pablo Picasso')) ph.textContent = 'Picasso';
    else Tupa.appendWithBibleItalics(ph, lot.title);
    stage.replaceChildren(ph);
    $('.room-toggle')?.remove();
    return;
  }
  img.src = currentSrc;
  img.alt = altText(lot);
  // Bound volumes cannot hang on a wall - the catalogue can opt a lot out
  if (lot.roomView === false) $('.room-toggle')?.remove();

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

  /* Room view - the piece composited on the wall at true relative scale.
     Paintings keep the photo's own aspect ratio and match the artwork's real
     area (several photos are not cropped to the catalogued proportions, and
     the catalogue is not consistent about width x height vs height x width).
     Pottery stands on the bench instead, using its background-free cutout. */
  const isObject = lot.category === 'pottery';
  const cutout = isObject && lot.cutout ? lot.cutout : null;

  function placeInRoom() {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    if (!sw || !sh) return;
    const cover = Math.max(sw / WALL.imgW, sh / WALL.imgH);
    const ppi = (WALL.imgW / WALL.wallInches) * cover; // rendered px per inch
    const offY = (sh - WALL.imgH * cover) / 2;
    // Until the photo has loaded its natural size is unknown; place it from
    // the catalogued proportions and correct it the moment it arrives.
    if (!img.complete || !img.naturalWidth) {
      img.addEventListener('load', placeInRoom, { once: true });
    }
    const ar = img.naturalWidth && img.naturalHeight
      ? img.naturalWidth / img.naturalHeight
      : lot.widthIn / lot.heightIn;
    const junction = offY + WALL.floorFromTopIn * (WALL.imgW / WALL.wallInches) * cover; // floor line
    const benchTop = junction - WALL.benchHeightIn * ppi;
    let w, h, top;
    if (isObject) {
      // Height is the largest catalogued dimension (the platter is shown
      // face-on, so that is its diameter). Small pieces are lifted to a
      // minimum size so they read at all on screen - not strictly to scale.
      h = Math.max(lot.widthIn, lot.heightIn) * ppi;
      h = Math.max(h, sh * WALL.minObjectFrac);
      w = h * ar;
      const maxW = WALL.benchWidthIn * ppi * 0.9;
      if (w > maxW) { h *= maxW / w; w = maxW; }
      top = benchTop - h + 2;
    } else {
      const areaIn = lot.widthIn * lot.heightIn;
      w = Math.sqrt(areaIn * ar) * ppi;
      h = Math.sqrt(areaIn / ar) * ppi;
      // Keep a band of wall above the work, never hang it down into the
      // bench, and never let it run off the sides.
      const minTop = Math.max(offY, 0) + sh * 0.07;
      const lowest = benchTop - WALL.benchGapIn * ppi;
      const fit = Math.min(1, (lowest - minTop) / h, (sw * 0.86) / w);
      if (fit < 1) { w *= fit; h *= fit; }
      top = junction - WALL.eyeHeightIn * ppi - h / 2; // centred at 57in eye height
      top = Math.min(Math.max(top, minTop), lowest - h);
    }
    img.style.width = `${w}px`;
    img.style.height = `${h}px`;
    img.style.left = `${(sw - w) / 2}px`;
    img.style.top = `${top}px`;
  }

  const roomBtn = $('.room-toggle');
  if (roomBtn) roomBtn.addEventListener('click', () => {
    roomMode = !roomMode;
    roomBtn.setAttribute('aria-pressed', String(roomMode));
    resetZoom();
    stage.classList.toggle('lot-stage--room', roomMode);
    stage.classList.toggle('lot-stage--object', roomMode && !!cutout);
    if (roomMode) {
      if (cutout) img.src = cutout; // background removed so it sits on the bench
      placeInRoom();
    } else {
      if (cutout) img.src = currentSrc;
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

/* ------------------------------------------------- Films about the work */

function initFilms(lot) {
  const wrap = $('[data-films]');
  if (!wrap || !lot.videos || !lot.videos.length) return;

  const head = document.createElement('p');
  head.className = 'films__head';
  head.textContent = 'Watch';

  const row = document.createElement('div');
  row.className = 'films__row';

  lot.videos.forEach((v) => {
    const a = document.createElement('a');
    a.className = 'film-card';
    a.href = v.url;
    a.target = '_blank';
    a.rel = 'noopener';

    const frame = document.createElement('span');
    frame.className = 'film-card__frame';
    if (v.poster) {
      const img = document.createElement('img');
      img.src = v.poster;
      img.alt = '';
      img.loading = 'lazy';
      img.width = 640;
      img.height = 360;
      frame.appendChild(img);
    }
    const play = document.createElement('span');
    play.className = 'film-card__play';
    play.setAttribute('aria-hidden', 'true');
    frame.appendChild(play);

    const text = document.createElement('span');
    text.className = 'film-card__text';
    if (v.source) {
      const src = document.createElement('span');
      src.className = 'film-card__source';
      src.textContent = v.source;
      text.appendChild(src);
    }
    const title = document.createElement('span');
    title.className = 'film-card__title';
    Tupa.appendWithBibleItalics(title, v.title);
    text.appendChild(title);

    a.append(frame, text);
    row.appendChild(a);
  });

  wrap.append(head, row);
  wrap.hidden = false;
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
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(location.href);
      const old = btn.textContent;
      btn.textContent = 'Link copied';
      setTimeout(() => { btn.textContent = old; }, 2000);
    } else {
      // Insecure context (e.g. file://) — no clipboard API; show the URL.
      window.prompt('Copy this link:', location.href);
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

})();
