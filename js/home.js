// Home — featured lots rail rendered from the embedded lot data.
// Classic script; requires data/lots.js, js/data.js, js/reveal.js, js/rail.js.

(function () {
  'use strict';

  const rail = document.querySelector('[data-featured-rail]');
  if (!rail) return;

  Tupa.getLots().then((lots) => {
    const featured = lots.filter((l) => l.category === 'tupa').slice(0, 5)
      .concat(lots.filter((l) => l.category === 'bible').slice(0, 1))
      .concat(lots.filter((l) => l.category === 'pottery').slice(0, 1));
    featured.forEach((lot) => rail.appendChild(Tupa.buildLotCard(lot)));

    const cta = document.createElement('a');
    cta.className = 'rail-cta reveal';
    cta.href = 'auction.html';
    cta.innerHTML = 'View all lots&nbsp;&rarr;';
    rail.appendChild(cta);

    Tupa.observeReveals(rail.parentElement);
    Tupa.initRails(rail.parentElement);
  }).catch(() => {
    const section = rail.closest('section');
    if (section) section.remove();
  });
})();
