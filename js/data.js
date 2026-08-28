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

  Tupa.SALE_LABELS = {
    live: 'Live Auction',
    silent: 'Silent Auction',
  };

  /* Work title is always italic. Matches "The Saint John's Bible" / "St. John's Bible"
     with straight or curly apostrophes. */
  const BIBLE_NAME_RE = /(The )?(?:Saint|St\.) John['\u2019]s Bible/g;

  Tupa.appendWithBibleItalics = function (el, text) {
    if (text == null || text === '') return el;
    const str = String(text);
    const re = new RegExp(BIBLE_NAME_RE.source, 'g');
    let last = 0;
    let m;
    while ((m = re.exec(str)) !== null) {
      if (m.index > last) el.appendChild(document.createTextNode(str.slice(last, m.index)));
      const em = document.createElement('em');
      em.textContent = m[0];
      el.appendChild(em);
      last = re.lastIndex;
    }
    if (last < str.length) el.appendChild(document.createTextNode(str.slice(last)));
    return el;
  };

  Tupa.setWithBibleItalics = function (el, text) {
    el.textContent = '';
    return Tupa.appendWithBibleItalics(el, text);
  };

  const money = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  });

  Tupa.formatMoney = (n) => money.format(n);

  Tupa.formatEstimate = function (lot) {
    if (lot.estimateLow == null) return 'Estimate on request';
    if (lot.estimateHigh == null || lot.estimateHigh === lot.estimateLow) {
      return money.format(lot.estimateLow);
    }
    return `${money.format(lot.estimateLow)} \u2013 ${money.format(lot.estimateHigh)}`;
  };

  Tupa.lotNumberLabel = function (lot) {
    const prefix = lot.sale === 'silent' ? 'SILENT' : 'LIVE';
    return `${prefix} LOT ${String(lot.lotNumber).padStart(2, '0')}`;
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
      ph.textContent = '';
      if (lot.artist === 'Pablo Picasso' || String(lot.artist).startsWith('Pablo Picasso')) ph.textContent = 'Picasso';
      else Tupa.appendWithBibleItalics(ph, lot.title);
      frame.appendChild(ph);
    }

    const meta = document.createElement('div');
    meta.className = 'lot-card__meta';

    const num = document.createElement('div');
    num.className = 'lot-card__number';
    num.textContent = Tupa.lotNumberLabel(lot);

    const title = document.createElement('h3');
    title.className = 'lot-card__title';
    Tupa.appendWithBibleItalics(title, lot.title);

    const cap = document.createElement('div');
    cap.className = 'caption lot-card__caption';
    Tupa.appendWithBibleItalics(cap, [lot.artist, lot.medium, (lot.dimensionsIn || '').replace(/\s*\n\s*/g, ' · ')]
      .filter(Boolean).join(' \u00B7 '));

    meta.append(num, title, cap);
    a.append(frame, meta);
    return a;
  };
})();
