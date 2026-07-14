// Shared data access + lot rendering helpers.

let lotsPromise = null;
export function getLots() {
  lotsPromise ??= fetch('data/lots.json').then((r) => {
    if (!r.ok) throw new Error(`lots.json ${r.status}`);
    return r.json();
  });
  return lotsPromise;
}

let sitePromise = null;
export function getSite() {
  sitePromise ??= fetch('data/site.json').then((r) => r.json());
  return sitePromise;
}

export const CATEGORY_LABELS = {
  tupa: 'Tupa Paintings',
  bible: 'The Saint John\u2019s Bible',
  pottery: 'Pottery',
  modern: 'Modern Masters',
  private: 'Private Collections',
};

const money = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
});

export function formatEstimate(lot) {
  if (lot.estimateLow == null) return 'Estimate on request';
  return `${money.format(lot.estimateLow)} \u2013 ${money.format(lot.estimateHigh)}`;
}

export function lotNumberLabel(lot) {
  return `LOT ${String(lot.lotNumber).padStart(3, '0')}`;
}

export function altText(lot) {
  return `${lot.artist}, ${lot.title}, ${lot.medium.toLowerCase()}`;
}

/* Build a lot card element (used by home rail, catalogue, artist, lot rail). */
export function buildLotCard(lot, { reveal = true } = {}) {
  const a = document.createElement('a');
  a.className = 'lot-card' + (reveal ? ' reveal' : '');
  a.href = `lot.html?lot=${lot.id}`;
  a.setAttribute('data-cursor', 'View');

  const frame = document.createElement('div');
  frame.className = 'lot-card__frame';
  if (lot.images.length) {
    const img = document.createElement('img');
    img.src = lot.images[0];
    img.alt = altText(lot);
    img.loading = 'lazy';
    img.width = 800;
    img.height = 1000;
    frame.appendChild(img);
  } else {
    const ph = document.createElement('div');
    ph.className = 'lot-card__placeholder';
    ph.textContent = lot.artist === 'Pablo Picasso' ? 'Picasso' : lot.title;
    frame.appendChild(ph);
  }

  const meta = document.createElement('div');
  meta.className = 'lot-card__meta';

  const num = document.createElement('div');
  num.className = 'lot-card__number';
  num.textContent = lotNumberLabel(lot);

  const title = document.createElement('h3');
  title.className = 'lot-card__title';
  title.textContent = lot.title;

  const cap = document.createElement('div');
  cap.className = 'caption lot-card__caption';
  cap.textContent = [lot.artist, lot.medium, lot.dimensionsIn]
    .filter(Boolean).join(' \u00B7 ');

  const est = document.createElement('div');
  est.className = 'lot-card__estimate';
  est.textContent = formatEstimate(lot);

  meta.append(num, title, cap, est);
  a.append(frame, meta);
  return a;
}
