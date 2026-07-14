// Placeholder-asset generator for the Father Jerome Tupa Auction site.
// Real photography from the client's Drive folder replaces these files 1:1
// (same paths, same names) — nothing else in the site needs to change.
//
// Usage: node scripts/generate-art.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* ---------------------------------------------------------------- utils */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const rnd = (rng, min, max) => min + rng() * (max - min);
const fx = (n) => Math.round(n * 10) / 10;

/* Fauvist-adjacent palette built off the four brand Pantones */
const HUES = ['#EF3340', '#FFCD00', '#1B75BB', '#00A398',
  '#B0202B', '#E0A526', '#14568A', '#00776F', '#F26B3A', '#F1EFE8'];

function grainDefs(id, opacity = 0.05) {
  return `<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacity} 0"/></filter>`;
}

/* Smooth closed blob through jittered radial points */
function blobPath(rng, cx, cy, r) {
  const n = 6 + Math.floor(rng() * 4);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng() * 0.5;
    const rad = r * rnd(rng, 0.55, 1.25);
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = `M ${fx(mid(pts[n - 1], pts[0])[0])} ${fx(mid(pts[n - 1], pts[0])[1])}`;
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    d += ` Q ${fx(pts[i][0])} ${fx(pts[i][1])} ${fx(m[0])} ${fx(m[1])}`;
  }
  return d + ' Z';
}

function brushStroke(rng, w, h) {
  const x0 = rnd(rng, 0, w), y0 = rnd(rng, 0, h);
  const x1 = x0 + rnd(rng, -w * 0.4, w * 0.4);
  const y1 = y0 + rnd(rng, -h * 0.4, h * 0.4);
  const cx = (x0 + x1) / 2 + rnd(rng, -w * 0.2, w * 0.2);
  const cy = (y0 + y1) / 2 + rnd(rng, -h * 0.2, h * 0.2);
  return `M ${fx(x0)} ${fx(y0)} Q ${fx(cx)} ${fx(cy)} ${fx(x1)} ${fx(y1)}`;
}

/* ------------------------------------------------ painting generators */

function paintingSVG(seed, w, h, opts = {}) {
  const rng = mulberry32(seed);
  const base = opts.base || pick(rng, HUES.slice(0, 4));
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
  s += `<defs>${grainDefs('g')}</defs>`;
  s += `<rect width="${w}" height="${h}" fill="${base}"/>`;
  const blobs = 7 + Math.floor(rng() * 5);
  for (let i = 0; i < blobs; i++) {
    const c = pick(rng, HUES);
    s += `<path d="${blobPath(rng, rnd(rng, 0, w), rnd(rng, 0, h), rnd(rng, w * 0.12, w * 0.42))}" fill="${c}" opacity="${fx(rnd(rng, 0.75, 0.98))}"/>`;
  }
  const strokes = 10 + Math.floor(rng() * 10);
  for (let i = 0; i < strokes; i++) {
    const c = pick(rng, HUES);
    s += `<path d="${brushStroke(rng, w, h)}" fill="none" stroke="${c}" stroke-width="${fx(rnd(rng, w * 0.008, w * 0.045))}" stroke-linecap="round" opacity="${fx(rnd(rng, 0.6, 0.95))}"/>`;
  }
  s += `<rect width="${w}" height="${h}" filter="url(#g)"/>`;
  s += `</svg>`;
  return s;
}

function bibleSVG(seed, w, h) {
  const rng = mulberry32(seed);
  const gold = '#C9A227', parchment = '#F5EEDC', ink = '#2B2620';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
  s += `<defs>${grainDefs('g', 0.04)}</defs>`;
  s += `<rect width="${w}" height="${h}" fill="${parchment}"/>`;
  const m = w * 0.09;
  s += `<rect x="${m}" y="${m}" width="${w - 2 * m}" height="${h - 2 * m}" fill="none" stroke="${gold}" stroke-width="${w * 0.012}"/>`;
  // illuminated block, upper left
  const bs = w * 0.3;
  s += `<rect x="${m * 1.6}" y="${m * 1.6}" width="${bs}" height="${bs}" fill="${gold}"/>`;
  for (let i = 0; i < 6; i++) {
    s += `<path d="${blobPath(rng, m * 1.6 + rnd(rng, 0, bs), m * 1.6 + rnd(rng, 0, bs), bs * 0.22)}" fill="${pick(rng, ['#1B75BB', '#EF3340', '#00A398', '#8A2BE2'])}" opacity="0.85"/>`;
  }
  s += `<rect x="${m * 1.6}" y="${m * 1.6}" width="${bs}" height="${bs}" fill="none" stroke="${ink}" stroke-width="${w * 0.006}"/>`;
  // text lines
  const tx = m * 1.6 + bs + w * 0.05;
  let ty = m * 1.9;
  while (ty < m * 1.6 + bs) {
    s += `<rect x="${tx}" y="${fx(ty)}" width="${fx(w - m * 1.6 - tx - rnd(rng, 0, w * 0.08))}" height="${w * 0.012}" fill="${ink}" opacity="0.75"/>`;
    ty += w * 0.045;
  }
  ty = m * 1.6 + bs + h * 0.05;
  while (ty < h - m * 1.7) {
    s += `<rect x="${m * 1.6}" y="${fx(ty)}" width="${fx(w - 3.2 * m - rnd(rng, 0, w * 0.14))}" height="${w * 0.012}" fill="${ink}" opacity="0.75"/>`;
    ty += w * 0.045;
  }
  // gold flourishes along the border
  for (let i = 0; i < 5; i++) {
    s += `<path d="${brushStroke(rng, w, h)}" fill="none" stroke="${gold}" stroke-width="${w * 0.006}" opacity="0.5"/>`;
  }
  s += `<rect width="${w}" height="${h}" filter="url(#g)"/></svg>`;
  return s;
}

function potterySVG(seed, w, h, kind) {
  const rng = mulberry32(seed);
  const bg = '#EDE9DF', clay = '#5C4B3A', glaze = '#7B8577', dark = '#33291F';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
  s += `<defs>${grainDefs('g', 0.05)}<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${glaze}"/><stop offset="1" stop-color="${clay}"/></linearGradient></defs>`;
  s += `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  s += `<rect y="${h * 0.78}" width="${w}" height="${h * 0.22}" fill="#DCD5C6"/>`;
  const cx = w / 2;
  if (kind === 'bowl') {
    s += `<path d="M ${cx - w * 0.28} ${h * 0.45} C ${cx - w * 0.3} ${h * 0.72}, ${cx - w * 0.14} ${h * 0.8}, ${cx} ${h * 0.8} C ${cx + w * 0.14} ${h * 0.8}, ${cx + w * 0.3} ${h * 0.72}, ${cx + w * 0.28} ${h * 0.45} Z" fill="url(#gl)"/>`;
    s += `<ellipse cx="${cx}" cy="${h * 0.45}" rx="${w * 0.28}" ry="${w * 0.045}" fill="${dark}"/>`;
  } else {
    s += `<path d="M ${cx - w * 0.07} ${h * 0.16} C ${cx - w * 0.07} ${h * 0.25}, ${cx - w * 0.24} ${h * 0.32}, ${cx - w * 0.24} ${h * 0.52} C ${cx - w * 0.24} ${h * 0.72}, ${cx - w * 0.13} ${h * 0.8}, ${cx} ${h * 0.8} C ${cx + w * 0.13} ${h * 0.8}, ${cx + w * 0.24} ${h * 0.72}, ${cx + w * 0.24} ${h * 0.52} C ${cx + w * 0.24} ${h * 0.32}, ${cx + w * 0.07} ${h * 0.25}, ${cx + w * 0.07} ${h * 0.16} Z" fill="url(#gl)"/>`;
    s += `<ellipse cx="${cx}" cy="${h * 0.16}" rx="${w * 0.07}" ry="${w * 0.018}" fill="${dark}"/>`;
  }
  for (let i = 0; i < 7; i++) {
    const y0 = rnd(rng, h * 0.3, h * 0.6);
    s += `<path d="M ${fx(cx + rnd(rng, -w * 0.18, w * 0.18))} ${fx(y0)} q ${fx(rnd(rng, -8, 8))} ${fx(rnd(rng, h * 0.06, h * 0.16))} 0 ${fx(rnd(rng, h * 0.1, h * 0.2))}" stroke="${pick(rng, ['#A67B4F', '#3E5C55', '#8E9B8B'])}" stroke-width="${w * 0.012}" fill="none" opacity="0.6" stroke-linecap="round"/>`;
  }
  s += `<ellipse cx="${cx}" cy="${h * 0.81}" rx="${w * 0.26}" ry="${w * 0.03}" fill="#00000022"/>`;
  s += `<rect width="${w}" height="${h}" filter="url(#g)"/></svg>`;
  return s;
}

function portraitSVG(w, h) {
  const rng = mulberry32(777);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
  s += `<defs>${grainDefs('g', 0.06)}</defs>`;
  s += `<rect width="${w}" height="${h}" fill="#E8E4DA"/>`;
  // canvases on the studio wall behind
  const canv = [[0.04, 0.08, 0.26, 0.42, 11], [0.33, 0.05, 0.3, 0.5, 22], [0.67, 0.1, 0.29, 0.44, 33], [0.06, 0.56, 0.22, 0.3, 44], [0.72, 0.58, 0.24, 0.3, 55]];
  for (const [x, y, cw, ch, seed] of canv) {
    const rng2 = mulberry32(seed);
    const px = x * w, py = y * h, pw = cw * w, ph = ch * h;
    s += `<g><rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${pick(rng2, HUES)}"/>`;
    for (let i = 0; i < 5; i++) {
      s += `<path d="${blobPath(rng2, px + rnd(rng2, 0, pw), py + rnd(rng2, 0, ph), pw * 0.25)}" fill="${pick(rng2, HUES)}" opacity="0.9"/>`;
    }
    s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="none" stroke="#141414" stroke-width="3"/>`;
    s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="none" stroke="#00000000"/></g>`;
  }
  // robed figure silhouette, back to viewer, brush in hand
  const cx = w * 0.5;
  s += `<g fill="#26221E">`;
  s += `<ellipse cx="${cx}" cy="${h * 0.34}" rx="${w * 0.045}" ry="${w * 0.05}"/>`; // head
  s += `<path d="M ${cx - w * 0.1} ${h * 0.46} Q ${cx} ${h * 0.38} ${cx + w * 0.1} ${h * 0.46} L ${cx + w * 0.13} ${h} L ${cx - w * 0.13} ${h} Z"/>`; // habit
  s += `<path d="M ${cx + w * 0.08} ${h * 0.5} Q ${cx + w * 0.16} ${h * 0.52} ${cx + w * 0.19} ${h * 0.44}" stroke="#26221E" stroke-width="${w * 0.03}" fill="none" stroke-linecap="round"/>`; // arm raised with brush
  s += `</g>`;
  s += `<line x1="${cx + w * 0.19}" y1="${h * 0.44}" x2="${cx + w * 0.21}" y2="${h * 0.38}" stroke="#8A5A2B" stroke-width="${w * 0.008}"/>`;
  s += `<rect width="${w}" height="${h}" filter="url(#g)"/></svg>`;
  return s;
}

function paletteSVG(w, h) {
  const rng = mulberry32(4242);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
  s += `<defs>${grainDefs('g', 0.06)}</defs>`;
  s += `<rect width="${w}" height="${h}" fill="#B98A54"/>`;
  s += `<path d="${blobPath(mulberry32(9), w * 0.5, h * 0.5, w * 0.42)}" fill="#A97B45"/>`;
  for (let i = 0; i < 16; i++) {
    s += `<path d="${blobPath(rng, rnd(rng, w * 0.15, w * 0.85), rnd(rng, h * 0.15, h * 0.85), rnd(rng, w * 0.03, w * 0.09))}" fill="${pick(rng, HUES)}" opacity="${fx(rnd(rng, 0.85, 1))}"/>`;
  }
  s += `<circle cx="${w * 0.82}" cy="${h * 0.28}" r="${w * 0.045}" fill="#8A6435"/>`;
  s += `<rect width="${w}" height="${h}" filter="url(#g)"/></svg>`;
  return s;
}

function wallSVG(w, h) {
  // Gallery wall for the "view in room" composite.
  // REAL-WORLD SCALE CONTRACT (js/lot.js relies on this): the full image
  // width represents 160 inches of wall, the full height 100 inches, and
  // the wall/floor junction sits 80 inches from the top (20-inch floor
  // band). The bench is 62 in wide.
  const ppi = w / 160;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`;
  s += `<rect width="${w}" height="${h}" fill="#F3F1EB"/>`;
  const floorY = h - 20 * ppi;
  s += `<rect y="${fx(floorY)}" width="${w}" height="${fx(h - floorY)}" fill="#D8CFC0"/>`;
  s += `<rect y="${fx(floorY - 4 * ppi)}" width="${w}" height="${fx(4 * ppi)}" fill="#E9E5DB"/>`; // baseboard
  // bench: 62in wide, 18in seat height, centered-left
  const bw = 62 * ppi, bh = 18 * ppi, bx = w * 0.5 - bw / 2, by = floorY - bh;
  s += `<rect x="${fx(bx)}" y="${fx(by)}" width="${fx(bw)}" height="${fx(6 * ppi)}" rx="${fx(2 * ppi)}" fill="#4A4038"/>`;
  s += `<rect x="${fx(bx + 4 * ppi)}" y="${fx(by + 6 * ppi)}" width="${fx(3 * ppi)}" height="${fx(bh - 6 * ppi)}" fill="#4A4038"/>`;
  s += `<rect x="${fx(bx + bw - 7 * ppi)}" y="${fx(by + 6 * ppi)}" width="${fx(3 * ppi)}" height="${fx(bh - 6 * ppi)}" fill="#4A4038"/>`;
  s += `<ellipse cx="${w / 2}" cy="${fx(floorY + 2 * ppi)}" rx="${fx(bw * 0.55)}" ry="${fx(2.4 * ppi)}" fill="#00000014"/>`;
  s += `</svg>`;
  return s;
}

/* ------------------------------------------------------------ lot data */

const LOTS = [
  { id: '001', lotNumber: 1, artist: 'Father Jerome Tupa', title: "Pilgrim's Road", year: 2017, medium: 'Oil on canvas', widthIn: 60, heightIn: 40, estimateLow: 9000, estimateHigh: 14000, category: 'tupa', seed: 101, images: 2,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'Painted after Tupa\u2019s walking pilgrimage along the Camino de Santiago, Pilgrim\u2019s Road compresses weeks of landscape into a single fauvist panorama \u2014 ochre fields, a ribbon of red road, and the high blue of a Spanish sky. The horizon tilts as if seen mid-stride; the paint is applied in the broad, joyful strokes that have become the artist\u2019s signature.' },
  { id: '002', lotNumber: 2, artist: 'Father Jerome Tupa', title: 'Silver Palace Tiles', year: 2019, medium: 'Oil on canvas', widthIn: 36, heightIn: 48, estimateLow: 8000, estimateHigh: 12000, category: 'tupa', seed: 202, images: 2,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'A meditation on pattern and light, Silver Palace Tiles takes the geometry of Moorish tilework and lets it dissolve into pure color. Squares of teal and gold interlock, then break rank \u2014 an ordered surface interrupted by paint, the way ritual is interrupted by joy.' },
  { id: '003', lotNumber: 3, artist: 'Father Jerome Tupa', title: 'Abbey Bells at Dusk', year: 2021, medium: 'Oil on canvas', widthIn: 48, heightIn: 60, estimateLow: 10000, estimateHigh: 15000, category: 'tupa', seed: 303, images: 2,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'The banner tower of Saint John\u2019s Abbey \u2014 Marcel Breuer\u2019s great concrete bell banner \u2014 rendered not as architecture but as sound: concentric waves of red and violet ringing outward across a darkening Minnesota sky. One of the largest canvases in the sale.' },
  { id: '004', lotNumber: 4, artist: 'Father Jerome Tupa', title: 'Umbrian Gate', year: 2015, medium: 'Oil on canvas', widthIn: 30, heightIn: 40, estimateLow: 6000, estimateHigh: 9000, category: 'tupa', seed: 404, images: 1,
    provenance: 'Private collection, Minneapolis; acquired directly from the artist.',
    essay: 'From the artist\u2019s Assisi period. A medieval gate in the Umbrian hills becomes a proscenium of hot yellow and rose, the passage beyond left ambiguous \u2014 an invitation rather than a destination. \u201CWe are all on a pilgrimage,\u201D Tupa has said. \u201CThat is the human condition.\u201D' },
  { id: '005', lotNumber: 5, artist: 'Father Jerome Tupa', title: 'The Long Walk to Compostela', year: 2018, medium: 'Oil on linen', widthIn: 72, heightIn: 36, estimateLow: 12000, estimateHigh: 18000, category: 'tupa', seed: 505, images: 2,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'A six-foot horizontal frieze \u2014 the widest work in the sale \u2014 tracing the pilgrim road west toward Santiago de Compostela. Waystations appear as flares of teal; the walking figures are barely more than brushmarks, dissolved into the landscape they cross.' },
  { id: '006', lotNumber: 6, artist: 'Father Jerome Tupa', title: 'Garden of the Cloister', year: 2022, medium: 'Oil on canvas', widthIn: 24, heightIn: 30, estimateLow: 4500, estimateHigh: 7000, category: 'tupa', seed: 606, images: 1,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'An intimate study of the abbey garden in high summer \u2014 beds of red and gold held inside the cool geometry of the cloister walk. The smallest Tupa canvas in the sale, and among the most concentrated.' },
  { id: '007', lotNumber: 7, artist: 'Donald Jackson & scribes', title: 'The Word Made Flesh \u2014 Illuminated Folio', year: 2005, medium: 'Ink, gold leaf and pigment on vellum (fine-art edition)', widthIn: 24.5, heightIn: 31.5, estimateLow: 5000, estimateHigh: 8000, category: 'bible', seed: 707, images: 1,
    provenance: 'The Saint John\u2019s Bible, Heritage Edition; Saint John\u2019s University, Collegeville, Minnesota.',
    essay: 'A folio from The Saint John\u2019s Bible \u2014 the first completely handwritten and illuminated Bible commissioned by a Benedictine abbey since the invention of the printing press. Gold leaf catches and returns the light of the room, as the illuminators intended.' },
  { id: '008', lotNumber: 8, artist: 'Donald Jackson & scribes', title: 'Genesis Frontispiece \u2014 Illuminated Folio', year: 2003, medium: 'Ink, gold leaf and pigment on vellum (fine-art edition)', widthIn: 24.5, heightIn: 31.5, estimateLow: 6000, estimateHigh: 9000, category: 'bible', seed: 808, images: 1,
    provenance: 'The Saint John\u2019s Bible, Heritage Edition; Saint John\u2019s University, Collegeville, Minnesota.',
    essay: 'The opening of Genesis: seven vertical bands of creation emerging from darkness into gold. Among the most reproduced images of the entire Saint John\u2019s Bible project, offered here as a museum-grade illuminated folio.' },
  { id: '009', lotNumber: 9, artist: 'Richard Bresnahan', title: 'Tea Bowl, Nanban-Glazed', year: 2016, medium: 'Wood-fired stoneware, natural ash glaze', widthIn: 5.5, heightIn: 4, estimateLow: 1200, estimateHigh: 1800, category: 'pottery', seed: 909, images: 1, potteryKind: 'bowl',
    provenance: 'Saint John\u2019s Pottery, Collegeville, Minnesota.',
    essay: 'Fired in the Johanna Kiln \u2014 the largest wood-burning kiln in North America \u2014 at Saint John\u2019s Pottery, where Bresnahan has been artist-in-residence since 1979. The nanban surface is unglazed by hand; the kiln itself paints it in ten days of continuous firing.' },
  { id: '010', lotNumber: 10, artist: 'Richard Bresnahan', title: 'Sculpted Vase with Natural Ash Glaze', year: 2019, medium: 'Wood-fired stoneware, local Minnesota clay', widthIn: 9, heightIn: 16, estimateLow: 2500, estimateHigh: 4000, category: 'pottery', seed: 1010, images: 1, potteryKind: 'vase',
    provenance: 'Saint John\u2019s Pottery, Collegeville, Minnesota.',
    essay: 'Thrown from clay dug within thirty miles of the abbey and fired with deadfall timber from its forest \u2014 Bresnahan\u2019s practice is a closed ecological loop, and every surface records the fire that finished it.' },
  { id: '011', lotNumber: 11, artist: 'Pablo Picasso', title: 'Original Work \u2014 Details Announced at Sale', year: null, medium: 'To be announced', widthIn: 20, heightIn: 26, estimateLow: null, estimateHigh: null, category: 'modern', seed: 1111, images: 0,
    provenance: 'Distinguished private collection. Full catalogue entry available at the evening sale.',
    essay: 'An original work by Pablo Picasso, offered from a distinguished private collection. In keeping with the consignor\u2019s wishes, full details \u2014 title, date, medium and estimate \u2014 will be announced in the room on the evening of the sale.' },
  { id: '012', lotNumber: 12, artist: 'Private collection', title: 'Lakeshore, Minnesota', year: 1954, medium: 'Oil on board', widthIn: 32, heightIn: 24, estimateLow: 3000, estimateHigh: 5000, category: 'private', seed: 1212, images: 1,
    provenance: 'Private collection, Wayzata, Minnesota.',
    essay: 'A mid-century Minnesota lakeshore in late light, from a distinguished private collection \u2014 one of several regional works consigned in support of the abbey and university.' },
  { id: '013', lotNumber: 13, artist: 'Private collection', title: 'Still Life with Lilies', year: 1962, medium: 'Oil on canvas', widthIn: 22, heightIn: 28, estimateLow: 2000, estimateHigh: 3500, category: 'private', seed: 1313, images: 1,
    provenance: 'Private collection, Edina, Minnesota.',
    essay: 'Cut lilies against a field of loose, confident color \u2014 consigned from a private Twin Cities collection in support of the enduring missions of Saint John\u2019s Abbey and Saint John\u2019s University.' },
];

/* --------------------------------------------------------------- write */

const dirs = ['assets/lots', 'assets/brand', 'data'];
for (const d of dirs) mkdirSync(join(ROOT, d), { recursive: true });

const CM = (inches) => Math.round(inches * 2.54 * 10) / 10;
const records = [];

for (const lot of LOTS) {
  const images = [];
  const px = 1400;
  const w = lot.widthIn >= lot.heightIn ? px : Math.round(px * (lot.widthIn / lot.heightIn));
  const h = lot.widthIn >= lot.heightIn ? Math.round(px * (lot.heightIn / lot.widthIn)) : px;
  for (let i = 1; i <= lot.images; i++) {
    const file = `assets/lots/lot-${lot.id}-${i}.svg`;
    let svg;
    if (lot.category === 'bible') svg = bibleSVG(lot.seed + i, w, h);
    else if (lot.category === 'pottery') svg = potterySVG(lot.seed + i, 1400, 1400, lot.potteryKind);
    else svg = paintingSVG(lot.seed + i * 17, w, h);
    writeFileSync(join(ROOT, file), svg);
    images.push(file);
  }
  records.push({
    id: lot.id, lotNumber: lot.lotNumber, artist: lot.artist, title: lot.title,
    year: lot.year, medium: lot.medium,
    dimensionsIn: `${lot.widthIn} \u00D7 ${lot.heightIn} in`,
    dimensionsCm: `${CM(lot.widthIn)} \u00D7 ${CM(lot.heightIn)} cm`,
    widthIn: lot.widthIn, heightIn: lot.heightIn,
    estimateLow: lot.estimateLow, estimateHigh: lot.estimateHigh,
    category: lot.category, provenance: lot.provenance, essay: lot.essay,
    images,
  });
}

writeFileSync(join(ROOT, 'data/lots.json'), JSON.stringify(records, null, 2));

writeFileSync(join(ROOT, 'assets/brand/portrait-studio.svg'), portraitSVG(1800, 1200));
writeFileSync(join(ROOT, 'assets/brand/palette.svg'), paletteSVG(1600, 1000));
writeFileSync(join(ROOT, 'assets/brand/hero.svg'), paintingSVG(20260, 2400, 1400, { base: '#1B75BB' }));
writeFileSync(join(ROOT, 'assets/brand/texture-1.svg'), paintingSVG(31, 2000, 700));
writeFileSync(join(ROOT, 'assets/brand/texture-2.svg'), paintingSVG(47, 2000, 700, { base: '#00A398' }));
writeFileSync(join(ROOT, 'assets/brand/texture-3.svg'), paintingSVG(59, 2000, 700, { base: '#EF3340' }));
writeFileSync(join(ROOT, 'assets/brand/wall.svg'), wallSVG(1600, 1000));

console.log(`Wrote ${records.length} lot records, ${records.reduce((n, r) => n + r.images.length, 0)} lot images, and brand assets.`);
