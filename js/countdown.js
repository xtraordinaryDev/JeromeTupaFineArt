// Countdown to the evening sale — rolling odometer digits.
// Each digit renders as a masked vertical column of 0–9 translated into
// place; under prefers-reduced-motion the CSS transition is disabled and
// the digits simply swap.

const TARGET = new Date('2026-10-22T16:00:00-05:00');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

function makeDigit() {
  const odo = document.createElement('span');
  odo.className = 'odo';
  const col = document.createElement('span');
  col.className = 'odo__col';
  for (let d = 0; d <= 9; d++) {
    const s = document.createElement('span');
    s.textContent = d;
    col.appendChild(s);
  }
  odo.appendChild(col);
  odo._col = col;
  odo._val = -1;
  return odo;
}

function setDigit(odo, val) {
  if (odo._val === val) return;
  odo._val = val;
  odo._col.style.transform = `translateY(-${val}em)`;
}

function remaining() {
  const ms = Math.max(0, TARGET - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hrs: Math.floor((s % 86400) / 3600),
    min: Math.floor((s % 3600) / 60),
    sec: s % 60,
  };
}

export function initCountdown(el) {
  const groups = [
    ['days', 'Days', 3],
    ['hrs', 'Hrs', 2],
    ['min', 'Min', 2],
    ['sec', 'Sec', 2],
  ];
  const digitMap = {};
  groups.forEach(([key, label, count], gi) => {
    if (gi > 0) {
      const sep = document.createElement('span');
      sep.className = 'countdown__sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = ':';
      if (key === 'sec') sep.classList.add('countdown__group--sec');
      el.appendChild(sep);
    }
    const group = document.createElement('span');
    group.className = 'countdown__group' + (key === 'sec' ? ' countdown__group--sec' : '');
    const digits = document.createElement('span');
    digits.className = 'countdown__digits';
    digitMap[key] = [];
    for (let i = 0; i < count; i++) {
      const d = makeDigit();
      digits.appendChild(d);
      digitMap[key].push(d);
    }
    const lab = document.createElement('span');
    lab.className = 'countdown__label';
    lab.textContent = label;
    group.append(digits, lab);
    el.appendChild(group);
  });

  const live = document.createElement('span');
  live.className = 'sr-only';
  el.setAttribute('role', 'timer');

  function tick() {
    const r = remaining();
    groups.forEach(([key, , count]) => {
      const str = String(r[key]).padStart(count, '0');
      digitMap[key].forEach((odo, i) => setDigit(odo, +str[i]));
    });
    el.setAttribute('aria-label',
      `${r.days} days, ${r.hrs} hours, ${r.min} minutes until the auction`);
  }
  tick();
  setInterval(tick, 1000);
}

document.querySelectorAll('[data-countdown]').forEach(initCountdown);
// Reduced-motion handling lives in CSS (.odo__col transition: none).
void reduced;
