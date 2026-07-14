// Nav scroll state, current-page marker, mobile overlay menu (focus-trapped),
// and the one-time signature stroke-draw.

const nav = document.querySelector('.site-nav');
const menu = document.querySelector('.mobile-menu');
const burger = document.querySelector('.nav-burger');

/* Scrolled state */
function onScroll() {
  nav?.classList.toggle('is-scrolled', window.scrollY > 80);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* aria-current on the active link */
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.site-nav a, .mobile-menu a').forEach((a) => {
  if (a.getAttribute('href')?.split('#')[0] === page) {
    a.setAttribute('aria-current', 'page');
  }
});

/* Signature draw, once per session */
const logo = document.querySelector('.site-nav__logo svg');
if (logo && !sessionStorage.getItem('sigDrawn')) {
  logo.classList.add('sig-animate');
  sessionStorage.setItem('sigDrawn', '1');
}

/* Mobile overlay menu */
let lastFocused = null;

function focusables() {
  return [...menu.querySelectorAll('a[href], button:not([disabled])')]
    .filter((el) => el.offsetParent !== null || menu.classList.contains('is-open'));
}

function openMenu() {
  lastFocused = document.activeElement;
  menu.classList.add('is-open');
  menu.removeAttribute('hidden');
  document.body.classList.add('menu-open');
  burger.setAttribute('aria-expanded', 'true');
  menu.querySelector('.mobile-menu__close')?.focus();
  document.addEventListener('keydown', onMenuKeydown);
}

function closeMenu() {
  menu.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  burger.setAttribute('aria-expanded', 'false');
  document.removeEventListener('keydown', onMenuKeydown);
  lastFocused?.focus();
}

function onMenuKeydown(e) {
  if (e.key === 'Escape') { closeMenu(); return; }
  if (e.key !== 'Tab') return;
  const els = focusables();
  if (!els.length) return;
  const first = els[0];
  const last = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

if (menu && burger) {
  burger.addEventListener('click', openMenu);
  menu.querySelector('.mobile-menu__close')?.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
}
