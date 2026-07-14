// Home — featured lots rail rendered from lots.json.

import { getLots, buildLotCard } from './data.js';
import { observeReveals } from './reveal.js';
import { initRails } from './rail.js';

const rail = document.querySelector('[data-featured-rail]');

getLots().then((lots) => {
  const featured = [
    ...lots.filter((l) => l.category === 'tupa').slice(0, 5),
    ...lots.filter((l) => l.category === 'bible').slice(0, 1),
    ...lots.filter((l) => l.category === 'pottery').slice(0, 1),
  ];
  featured.forEach((lot) => rail.appendChild(buildLotCard(lot)));

  const cta = document.createElement('a');
  cta.className = 'rail-cta reveal';
  cta.href = 'auction.html';
  cta.innerHTML = 'View all lots&nbsp;&rarr;';
  rail.appendChild(cta);

  observeReveals(rail.parentElement);
  initRails(rail.parentElement);
}).catch(() => {
  rail.closest('section')?.remove();
});
