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
let maxEstimate = 20000;

const state = {
  cats: new Set(),
  min: 0,
  max: Infinity,
  sort: 'lot',
  view: 'grid',
};

/* ------------------------------------------------------- URL state */

function readURL() {
  const q = new URLSearchParams(location.search);
  state.cats = new Set((q.get('cat') || '').split(',').filter(Boolean));
  state.min = +q.get('min') || 0;
  state.max = +q.get('max') || maxEstimate;
  state.sort = q.get('sort') || 'lot';
  state.view = q.get('view') === 'wall' ? 'wall' : 'grid';
}

function writeURL() {
  const q = new URLSearchParams();
  if (state.cats.size) q.set('cat', [...state.cats].join(','));
  if (state.min > 0) q.set('min', state.min);
  if (state.max < maxEstimate) q.set('max', state.max);
  if (state.sort !== 'lot') q.set('sort', state.sort);
  if (state.view === 'wall') q.set('view', 'wall');
  const qs = q.toString();
  try {
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  } catch (e) { /* some browsers disallow replaceState on file:// — filters still work */ }
}

/* --------------------------------------------------------- Filtering */

function matches(lot) {
  if (state.cats.size && !state.cats.has(lot.category)) return false;
  if (lot.estimateLow == null) return true; // "estimate on request" always shows
  return lot.estimateHigh >= state.min && lot.estimateLow <= state.max;
}

function sorted(list) {
  const c = [...list];
  if (state.sort === 'est-asc') c.sort((a, b) => (a.estimateLow ?? Infinity) - (b.estimateLow ?? Infinity));
  else if (state.sort === 'est-desc') c.sort((a, b) => (b.estimateHigh ?? -1) - (a.estimateHigh ?? -1));
  else c.sort((a, b) => a.lotNumber - b.lotNumber);
  return c;
}

function render() {
  const visible = sorted(lots.filter(matches));
  grid.innerHTML = '';
  visible.forEach((lot) => grid.appendChild(Tupa.buildLotCard(lot)));
  countEl.textContent = `${visible.length} ${visible.length === 1 ? 'lot' : 'lots'}`;
  emptyEl.hidden = visible.length > 0;
  Tupa.observeReveals(grid.parentElement);
  writeURL();
}

/* ----------------------------------------------------- Control wiring */

function buildCategoryOptions() {
  const wrap = form.querySelector('[data-cat-options]');
  const counts = {};
  lots.forEach((l) => { counts[l.category] = (counts[l.category] || 0) + 1; });
  Object.entries(Tupa.CATEGORY_LABELS).forEach(([key, label]) => {
    const lab = document.createElement('label');
    lab.className = 'filter-option';
    lab.innerHTML = `<input type="checkbox" name="cat" value="${key}">
      <span>${label}</span><span class="count">${counts[key] || 0}</span>`;
    wrap.appendChild(lab);
  });
}

function syncControls() {
  form.querySelectorAll('input[name="cat"]').forEach((cb) => {
    cb.checked = state.cats.has(cb.value);
  });
  const lo = form.querySelector('[name="min"]');
  const hi = form.querySelector('[name="max"]');
  lo.max = hi.max = maxEstimate;
  lo.value = state.min;
  hi.value = Math.min(state.max, maxEstimate);
  form.querySelector('[name="sort"]').value = state.sort;
  updateRangeLabel();
}

function updateRangeLabel() {
  const fmt = (n) => '$' + (+n).toLocaleString('en-US');
  form.querySelector('[data-range-lo]').textContent = fmt(state.min);
  form.querySelector('[data-range-hi]').textContent =
    state.max >= maxEstimate ? fmt(maxEstimate) + '+' : fmt(state.max);
}

form.addEventListener('input', () => {
  state.cats = new Set([...form.querySelectorAll('input[name="cat"]:checked')].map((c) => c.value));
  let lo = +form.querySelector('[name="min"]').value;
  let hi = +form.querySelector('[name="max"]').value;
  if (lo > hi) [lo, hi] = [hi, lo];
  state.min = lo;
  state.max = hi;
  state.sort = form.querySelector('[name="sort"]').value;
  updateRangeLabel();
  render();
});

form.addEventListener('submit', (e) => e.preventDefault());

document.querySelector('.filter-clear').addEventListener('click', () => {
  state.cats.clear();
  state.min = 0;
  state.max = maxEstimate;
  state.sort = 'lot';
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
  maxEstimate = Math.ceil(Math.max(...lots.map((l) => l.estimateHigh || 0)) / 1000) * 1000;
  buildCategoryOptions();
  readURL();
  if (state.max === Infinity) state.max = maxEstimate;
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
