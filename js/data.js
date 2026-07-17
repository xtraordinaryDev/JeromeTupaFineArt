// Shared data access + lot rendering helpers. Classic script.
// Lot data is embedded by data/lots.js (window.TUPA_LOTS) so the site works
// from file://, any static host, or a local server — no fetch required.

window.Tupa = window.Tupa || {};

(function () {
  'use strict';

  Tupa.getLots = function () {
    return Array.isArray(window.TUPA_LOTS)
      ? Promise.resolve(window.TUPA_LOTS)
      : Promise.reject(new Error('data/lots.js not loaded'));
  };

  Tupa.CATEGORY_LABELS = {
    tupa: 'Tupa Paintings',
    bible: 'The Saint John\u2019s Bible',
    pottery: 'Pottery',
    modern: 'Modern Masters',
    private: 'Private Collections',
  };

  const money = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  });

  Tupa.formatEstimate = function (lot) {
    if (lot.estimateLow == null) return 'Estimate on request';
    return `${money.format(lot.estimateLow)} \u2013 ${money.format(lot.estimateHigh)}`;
  };

  Tupa.lotNumberLabel = function (lot) {
    return `LOT ${String(lot.lotNumber).padStart(3, '0')}`;
  };

  Tupa.altText = function (lot) {
    return `${lot.artist}, ${lot.title}, ${lot.medium.toLowerCase()}`;
  };

  /* Build a lot card element (home rail, catalogue, artist, lot rail). */
  Tupa.buildLotCard = function (lot, opts) {
    const reveal = !opts || opts.reveal !== false;
    const a = document.createElement('a');
    a.className = 'lot-card' + (reveal ? ' reveal' : '');
    a.href = `lot.html?lot=${lot.id}`;
    a.setAttribute('data-cursor', 'View');

    const frame = document.createElement('div');
    frame.className = 'lot-card__frame';
    if (lot.images.length) {
      const img = document.createElement('img');
      img.src = lot.images[0];
      img.alt = Tupa.altText(lot);
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
    num.textContent = Tupa.lotNumberLabel(lot);

    const title = document.createElement('h3');
    title.className = 'lot-card__title';
    title.textContent = lot.title;

    const cap = document.createElement('div');
    cap.className = 'caption lot-card__caption';
    cap.textContent = [lot.artist, lot.medium, lot.dimensionsIn]
      .filter(Boolean).join(' \u00B7 ');

    const est = document.createElement('div');
    est.className = 'lot-card__estimate';
    est.textContent = Tupa.formatEstimate(lot);

    meta.append(num, title, cap, est);
    a.append(frame, meta);
    return a;
  };
})();
