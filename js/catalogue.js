// Catalogue — filter/sort the embedded lot data, render, and keep state in
// the URL so filtered views are shareable. The mobile <dialog> sheet adopts
// the same filter form node, so there is exactly one set of controls.
// Classic script; requires data/lots.js, js/data.js, js/reveal.js.

(function () {
'use strict';

const grid = document.querySelector('[data-lot-grid]');
const countEl = document.querySelector('[data-result-count]');
const emptyEl = document.querySelector('[data-empty]');
const form = document.getElementById('filter-form');
const railSlot = document.querySelector('[data-rail-slot]');
const sheet = document.getElementById('filter-sheet');
const sheetSlot = sheet.querySelector('[data-sheet-slot]');

let lots = [];

const state = {
  sales: new Set(),
  cats: new Set(),
  artists: new Set(),
  view: 'grid',
};

/* ------------------------------------------------------- URL state */

function readURL() {
  const q = new URLSearchParams(location.search);
  state.sales = new Set((q.get('sale') || '').split(',').filter(Boolean));
  state.cats = new Set((q.get('cat') || '').split(',').filter(Boolean));
  state.artists = new Set((q.get('artist') || '').split('|').filter(Boolean));
  state.view = q.get('view') === 'wall' ? 'wall' : 'grid';
}

function writeURL() {
  const q = new URLSearchParams();
  if (state.sales.size) q.set('sale', [...state.sales].join(','));
  if (state.cats.size) q.set('cat', [...state.cats].join(','));
  if (state.artists.size) q.set('artist', [...state.artists].join('|'));
  if (state.view === 'wall') q.set('view', 'wall');
  const qs = q.toString();
  try {
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  } catch (e) { /* some browsers disallow replaceState on file:// — filters still work */ }
}

/* --------------------------------------------------------- Filtering */

function matches(lot) {
  if (state.sales.size && !state.sales.has(lot.sale)) return false;
  if (state.cats.size && !state.cats.has(lot.category)) return false;
  if (state.artists.size && !state.artists.has(lot.artist)) return false;
  return true;
}

function sorted(list) {
  return [...list].sort((a, b) => a.lotNumber - b.lotNumber);
}

function render() {
  const visible = sorted(lots.filter(matches));
  grid.innerHTML = '';
  Object.entries(Tupa.SALE_LABELS).forEach(([key, label]) => {
    const items = visible.filter((l) => l.sale === key);
    if (!items.length) return;
    const head = document.createElement('h2');
    head.className = 'lot-group-head';
    head.innerHTML = `${label} <span class="lot-group-head__count">${items.length} ${items.length === 1 ? 'lot' : 'lots'}</span>`;
    grid.appendChild(head);
    items.forEach((lot) => grid.appendChild(Tupa.buildLotCard(lot)));
  });
  countEl.textContent = `${visible.length} ${visible.length === 1 ? 'lot' : 'lots'}`;
  emptyEl.hidden = visible.length > 0;
  Tupa.observeReveals(grid.parentElement);
  writeURL();
}

/* ----------------------------------------------------- Control wiring */

function buildSaleOptions() {
  const wrap = form.querySelector('[data-sale-options]');
  const counts = {};
  lots.forEach((l) => { counts[l.sale] = (counts[l.sale] || 0) + 1; });
  Object.entries(Tupa.SALE_LABELS).forEach(([key, label]) => {
    const lab = document.createElement('label');
    lab.className = 'filter-option';
    lab.innerHTML = `<input type="checkbox" name="sale" value="${key}">
      <span>${label}</span><span class="count">${counts[key] || 0}</span>`;
    wrap.appendChild(lab);
  });
}

function buildCategoryOptions() {
  const wrap = form.querySelector('[data-cat-options]');
  const counts = {};
  lots.forEach((l) => { counts[l.category] = (counts[l.category] || 0) + 1; });
  Object.entries(Tupa.CATEGORY_LABELS).forEach(([key, label]) => {
    const lab = document.createElement('label');
    lab.className = 'filter-option';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = 'cat';
    cb.value = key;
    const name = document.createElement('span');
    Tupa.appendWithBibleItalics(name, label);
    const num = document.createElement('span');
    num.className = 'count';
    num.textContent = counts[key] || 0;
    lab.append(cb, name, num);
    wrap.appendChild(lab);
  });
}

function buildArtistOptions() {
  const wrap = form.querySelector('[data-artist-options]');
  const counts = new Map(); // insertion order follows lot order
  lots.forEach((l) => { counts.set(l.artist, (counts.get(l.artist) || 0) + 1); });
  counts.forEach((count, artist) => {
    const lab = document.createElement('label');
    lab.className = 'filter-option';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = 'artist';
    cb.value = artist;
    const name = document.createElement('span');
    Tupa.appendWithBibleItalics(name, artist);
    const num = document.createElement('span');
    num.className = 'count';
    num.textContent = count;
    lab.append(cb, name, num);
    wrap.appendChild(lab);
  });
}

function syncControls() {
  form.querySelectorAll('input[name="sale"]').forEach((cb) => {
    cb.checked = state.sales.has(cb.value);
  });
  form.querySelectorAll('input[name="cat"]').forEach((cb) => {
    cb.checked = state.cats.has(cb.value);
  });
  form.querySelectorAll('input[name="artist"]').forEach((cb) => {
    cb.checked = state.artists.has(cb.value);
  });
}

form.addEventListener('input', () => {
  state.sales = new Set([...form.querySelectorAll('input[name="sale"]:checked')].map((c) => c.value));
  state.cats = new Set([...form.querySelectorAll('input[name="cat"]:checked')].map((c) => c.value));
  state.artists = new Set([...form.querySelectorAll('input[name="artist"]:checked')].map((c) => c.value));
  render();
});

form.addEventListener('submit', (e) => e.preventDefault());

document.querySelector('.filter-clear').addEventListener('click', () => {
  state.sales.clear();
  state.cats.clear();
  state.artists.clear();
  syncControls();
  render();
});

/* View toggle: grid ⇄ wall */
const toggle = document.querySelector('.view-toggle');
function applyView() {
  document.body.classList.toggle('wall-view', state.view === 'wall');
  toggle.querySelectorAll('button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.view === state.view));
  });
}
toggle.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-view]');
  if (!btn) return;
  state.view = btn.dataset.view;
  applyView();
  writeURL();
});

/* Mobile bottom sheet adopts the single filter form */
document.querySelector('.filter-open').addEventListener('click', () => {
  sheetSlot.appendChild(form);
  sheet.showModal();
});
function closeSheet() {
  sheet.close();
}
sheet.addEventListener('close', () => railSlot.appendChild(form));
sheet.querySelector('.filter-sheet__close').addEventListener('click', closeSheet);
sheet.querySelector('[data-sheet-apply]').addEventListener('click', closeSheet);
sheet.addEventListener('click', (e) => {
  if (e.target === sheet) closeSheet(); // backdrop tap
});

/* ---------------------------------------------------------------- Go */

Tupa.getLots().then((data) => {
  lots = data;
  buildSaleOptions();
  buildCategoryOptions();
  buildArtistOptions();
  readURL();
  syncControls();
  applyView();
  render();
}).catch((err) => {
  countEl.textContent = '';
  emptyEl.hidden = false;
  emptyEl.querySelector('p').textContent = 'The catalogue could not be loaded. Please refresh the page.';
  console.error(err);
});

})();
