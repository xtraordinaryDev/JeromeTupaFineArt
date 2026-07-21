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

// Lots with `realImages` use client-supplied photography (no placeholder is
// generated). Titles/years/dimensions for the Tupa canvases are descriptive
// placeholders until the client confirms the final lot list.
const LOTS = [
  // Note: images/TupaArt/01_red_cityscape_tower.jpg is the same painting as
  // silver-palace-tiles.jpg (already lot 001) — not listed twice.
  { id: '001', lotNumber: 1, artist: 'Father Jerome Tupa', title: 'Silver Palace Tiles', year: 2019, medium: 'Oil on canvas', widthIn: 50, heightIn: 31, estimateLow: 8000, estimateHigh: 12000, category: 'tupa', seed: 202,
    realImages: ['assets/images/silver-palace-tiles.jpg'], images: 0,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'Silver Palace Tiles renders a silver-roofed palace as pure celebration \u2014 sweeping rooflines in white and grey, banded tiles of blue and red, and a garden of oversized blossoms pressing in from every edge. Architecture dissolves into pattern, the ordered surface interrupted by paint the way ritual is interrupted by joy.' },
  { id: '002', lotNumber: 2, artist: 'Father Jerome Tupa', title: 'City on a Checkerboard', year: 2014, medium: 'Oil on canvas', widthIn: 46, heightIn: 36, estimateLow: 8000, estimateHigh: 12000, category: 'tupa', seed: 303,
    realImages: ['assets/images/tupa-art-02.jpg'], images: 0,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'Beneath a sunset sky, a whole city leans and dances \u2014 spires, domes and crooked facades in red, gold and blue, all standing on a great checkerboard plaza. Tiny cars thread the squares below, dwarfed by the joyful architecture above.' },
  { id: '003', lotNumber: 3, artist: 'Father Jerome Tupa', title: 'City of Towers at Sunset', year: 2018, medium: 'Oil on canvas', widthIn: 40, heightIn: 34, estimateLow: 7000, estimateHigh: 10000, category: 'tupa', seed: 404,
    realImages: ['assets/images/tupa-art-04.jpg'], images: 0,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'Patterned towers twist against a burning orange sky, and the ground itself breaks into fields of colored checks. One of the most densely patterned canvases in the sale \u2014 every surface alive with ornament, as if the whole city were woven rather than built.' },
  { id: '004', lotNumber: 4, artist: 'Father Jerome Tupa', title: 'Hill Town in Orange', year: 2015, medium: 'Oil on canvas', widthIn: 40, heightIn: 32, estimateLow: 6000, estimateHigh: 9000, category: 'tupa', seed: 505,
    realImages: ['assets/images/tupa-art-05.jpg'], images: 0,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'Bell towers and tiled roofs crowd a hillside under a yellow sky \u2014 a pilgrim town remembered in heat and color rather than stone. The paint is applied in the broad, joyful strokes that have become the artist\u2019s signature.' },
  { id: '005', lotNumber: 5, artist: 'Father Jerome Tupa', title: 'Leaning Streets', year: 2013, medium: 'Oil on canvas', widthIn: 48, heightIn: 36, estimateLow: 8000, estimateHigh: 12000, category: 'tupa', seed: 606,
    realImages: ['assets/images/tupa-art-06.jpg'], images: 0,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'Old-town houses sway toward one another over a checkered street, their windows out of plumb, a white bell tower floating overhead in the blue. A city seen the way a walker remembers it \u2014 tilted, warm, and slightly impossible.' },
  { id: '006', lotNumber: 6, artist: 'Father Jerome Tupa', title: 'City with Golden Domes', year: 2019, medium: 'Oil on canvas', widthIn: 50, heightIn: 40, estimateLow: 10000, estimateHigh: 15000, category: 'tupa', seed: 707,
    realImages: ['assets/images/tupa-art-08.jpg'], images: 0,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'Golden onion domes rise over a plaza of red, yellow and teal facades, with cars threading the cobbles below. One of the largest canvases in the sale \u2014 a whole city compressed into a single radiant square.' },
  { id: '007', lotNumber: 7, artist: 'Father Jerome Tupa', title: 'Basilica with Striped Towers', year: 2017, medium: 'Oil on canvas', widthIn: 47, heightIn: 36, estimateLow: 9000, estimateHigh: 13000, category: 'tupa', seed: 808,
    realImages: ['assets/images/tupa-art-09.jpg'], images: 0,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'A red-roofed basilica flanked by great striped towers, set on a hillside of colored checks beneath curling vines of green and gold. Sacred architecture rendered as festival \u2014 pattern on pattern, joy on joy.' },
  { id: '008', lotNumber: 8, artist: 'Father Jerome Tupa', title: 'Courtyard Mandala', year: 2020, medium: 'Oil on canvas', widthIn: 30, heightIn: 40, estimateLow: 7000, estimateHigh: 10000, category: 'tupa', seed: 909,
    realImages: ['assets/images/tupa-art-11.jpg'], images: 0,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'Towers and arcades wheel around a courtyard laid with a great mandala of circles \u2014 the still center of a spinning city. A vertical canvas in the artist\u2019s late, most ornamental manner.' },
  { id: '009', lotNumber: 9, artist: 'Father Jerome Tupa', title: 'Portrait of a Man', year: 2011, medium: 'Oil on paper, framed', widthIn: 24, heightIn: 30, estimateLow: 4500, estimateHigh: 7000, category: 'tupa', seed: 1010,
    realImages: ['assets/images/tupa-art-03.jpg'], images: 0,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'A rare figure study \u2014 a long-faced man in a pale shirt against a wash of olive green, drawn with the same unguarded directness Tupa brings to his cities. The gaze is frank, patient, and a little amused.' },
  { id: '010', lotNumber: 10, artist: 'Father Jerome Tupa', title: 'The Embrace', year: 2012, medium: 'Oil on canvas, framed', widthIn: 30, heightIn: 34, estimateLow: 6000, estimateHigh: 9000, category: 'tupa', seed: 1111,
    realImages: ['assets/images/tupa-art-07.jpg'], images: 0,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'Two figures fold into one another in a field of deep red and black, their oversized hands meeting at the center of the canvas. Among the most intimate and painterly works in the sale \u2014 pilgrimage understood as companionship.' },
  { id: '011', lotNumber: 11, artist: 'Father Jerome Tupa', title: 'Blue Vessel', year: 2010, medium: 'Oil on canvas', widthIn: 22, heightIn: 26, estimateLow: 4500, estimateHigh: 7000, category: 'tupa', seed: 1212,
    realImages: ['assets/images/tupa-art-10.jpg'], images: 0,
    provenance: 'From the artist\u2019s studio, Saint John\u2019s Abbey, Collegeville, Minnesota.',
    essay: 'A vessel bursting with dark blooms against a sea of blue \u2014 part still life, part apparition. The smallest and moodiest canvas in the sale, painted wet-into-wet with the palette knife.' },
  { id: '012', lotNumber: 12, artist: 'Donald Jackson & scribes', title: 'The Word Made Flesh \u2014 Illuminated Folio', year: 2005, medium: 'Ink, gold leaf and pigment on vellum (fine-art edition)', widthIn: 24.5, heightIn: 31.5, estimateLow: 5000, estimateHigh: 8000, category: 'bible', seed: 707, images: 1,
    provenance: 'The Saint John\u2019s Bible, Heritage Edition; Saint John\u2019s University, Collegeville, Minnesota.',
    essay: 'A folio from The Saint John\u2019s Bible \u2014 the first completely handwritten and illuminated Bible commissioned by a Benedictine abbey since the invention of the printing press. Gold leaf catches and returns the light of the room, as the illuminators intended.' },
  { id: '013', lotNumber: 13, artist: 'Donald Jackson & scribes', title: 'Genesis Frontispiece \u2014 Illuminated Folio', year: 2003, medium: 'Ink, gold leaf and pigment on vellum (fine-art edition)', widthIn: 24.5, heightIn: 31.5, estimateLow: 6000, estimateHigh: 9000, category: 'bible', seed: 808, images: 1,
    provenance: 'The Saint John\u2019s Bible, Heritage Edition; Saint John\u2019s University, Collegeville, Minnesota.',
    essay: 'The opening of Genesis: seven vertical bands of creation emerging from darkness into gold. Among the most reproduced images of the entire Saint John\u2019s Bible project, offered here as a museum-grade illuminated folio.' },
  { id: '014', lotNumber: 14, artist: 'Richard Bresnahan', title: 'Bowl with Ash-Blue Glaze', year: 2016, medium: 'Wood-fired stoneware, natural ash glaze', widthIn: 12, heightIn: 4, estimateLow: 1200, estimateHigh: 1800, category: 'pottery', seed: 1313,
    realImages: ['assets/images/pottery-bowl.jpg'], images: 0,
    provenance: 'Saint John\u2019s Pottery, Collegeville, Minnesota.',
    essay: 'A wide bowl whose interior blooms with veils of blue and umber \u2014 painted not by hand but by ten days of continuous firing in the Johanna Kiln, the largest wood-burning kiln in North America, where Bresnahan has been artist-in-residence since 1979.' },
  { id: '015', lotNumber: 15, artist: 'Richard Bresnahan', title: 'Tall Vase with Grass Resist', year: 2019, medium: 'Wood-fired stoneware, local Minnesota clay', widthIn: 9, heightIn: 17, estimateLow: 2500, estimateHigh: 4000, category: 'pottery', seed: 1414,
    realImages: ['assets/images/pottery-tall-vase.jpg'], images: 0,
    provenance: 'Saint John\u2019s Pottery, Collegeville, Minnesota.',
    essay: 'Thrown from clay dug within thirty miles of the abbey and fired with deadfall timber from its forest \u2014 the tall body is wrapped in traces of prairie grass burned away in the kiln, every stroke recorded in ash.' },
  { id: '016', lotNumber: 16, artist: 'Richard Bresnahan', title: 'Round Vase with Flared Lip', year: 2021, medium: 'Wood-fired stoneware, natural ash glaze', widthIn: 10, heightIn: 14, estimateLow: 2000, estimateHigh: 3500, category: 'pottery', seed: 1515,
    realImages: ['assets/images/pottery-round-vase.jpg'], images: 0,
    provenance: 'Saint John\u2019s Pottery, Collegeville, Minnesota.',
    essay: 'A full-bellied vessel with a wide flared lip, its shoulder swept with rivers of orange, violet and iron \u2014 Bresnahan\u2019s closed ecological loop made visible, the kiln itself the final collaborator.' },
  { id: '017', lotNumber: 17, artist: 'Pablo Picasso', title: 'Toros en Vallauris', year: 1954, medium: 'Linocut poster', widthIn: 26, heightIn: 25, estimateLow: null, estimateHigh: null, category: 'modern', seed: 1616,
    realImages: ['assets/images/picasso-toros-en-vallauris.png'], images: 0,
    provenance: 'Distinguished private collection.',
    essay: 'Picasso\u2019s celebrated linocut poster for the 1954 bullfights at Vallauris \u2014 the arena, the crowd and the charging bull carved in bold black and white, signed in the block. Offered from a distinguished private collection; full catalogue details available at the evening sale.' },
  { id: '018', lotNumber: 18, artist: 'Yusuf', title: 'Three Seated Women', year: null, medium: 'Oil on canvas', widthIn: 60, heightIn: 42, estimateLow: 6000, estimateHigh: 9000, category: 'private', seed: 1717,
    realImages: ['assets/images/yusuf-three-women.jpg'], images: 0,
    provenance: 'Distinguished private collection.',
    essay: 'Three women in red, yellow and white sit in quiet dignity against a field of sage green and terracotta, their forms built from a mosaic of textured strokes. A commanding modern figurative canvas consigned from a distinguished private collection.' },
  { id: '019', lotNumber: 19, artist: 'Private collection', title: 'Lakeshore, Minnesota', year: 1954, medium: 'Oil on board', widthIn: 32, heightIn: 24, estimateLow: 3000, estimateHigh: 5000, category: 'private', seed: 1212, images: 1,
    provenance: 'Private collection, Wayzata, Minnesota.',
    essay: 'A mid-century Minnesota lakeshore in late light, from a distinguished private collection \u2014 one of several regional works consigned in support of the abbey and university.' },
  { id: '020', lotNumber: 20, artist: 'Private collection', title: 'Still Life with Lilies', year: 1962, medium: 'Oil on canvas', widthIn: 22, heightIn: 28, estimateLow: 2000, estimateHigh: 3500, category: 'private', seed: 1313, images: 1,
    provenance: 'Private collection, Edina, Minnesota.',
    essay: 'Cut lilies against a field of loose, confident color \u2014 consigned from a private Twin Cities collection in support of the enduring missions of Saint John\u2019s Abbey and Saint John\u2019s University.' },
];

/* --------------------------------------------------------------- write */

const dirs = ['assets/lots', 'assets/brand', 'data'];
for (const d of dirs) mkdirSync(join(ROOT, d), { recursive: true });

const CM = (inches) => Math.round(inches * 2.54 * 10) / 10;
const records = [];

for (const lot of LOTS) {
  const images = [...(lot.realImages ?? [])];
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
writeFileSync(join(ROOT, 'data/lots.js'),
  '// Lot data - embedded as a classic script so the site works from file://,\n' +
  '// any static host, or a local server (no fetch needed).\n' +
  '// Regenerate with: node scripts/generate-art.mjs\n' +
  'window.TUPA_LOTS = ' + JSON.stringify(records, null, 2) + ';\n');

writeFileSync(join(ROOT, 'assets/brand/portrait-studio.svg'), portraitSVG(1800, 1200));
writeFileSync(join(ROOT, 'assets/brand/palette.svg'), paletteSVG(1600, 1000));
writeFileSync(join(ROOT, 'assets/brand/hero.svg'), paintingSVG(20260, 2400, 1400, { base: '#1B75BB' }));
writeFileSync(join(ROOT, 'assets/brand/texture-1.svg'), paintingSVG(31, 2000, 700));
writeFileSync(join(ROOT, 'assets/brand/texture-2.svg'), paintingSVG(47, 2000, 700, { base: '#00A398' }));
writeFileSync(join(ROOT, 'assets/brand/texture-3.svg'), paintingSVG(59, 2000, 700, { base: '#EF3340' }));
writeFileSync(join(ROOT, 'assets/brand/wall.svg'), wallSVG(1600, 1000));

console.log(`Wrote ${records.length} lot records, ${records.reduce((n, r) => n + r.images.length, 0)} lot images, and brand assets.`);
