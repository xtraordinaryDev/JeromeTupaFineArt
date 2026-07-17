// Nav scroll state, current-page marker, and the mobile overlay menu
// (focus-trapped). Classic script.

(function () {
  'use strict';

  const nav = document.querySelector('.site-nav');
  const menu = document.querySelector('.mobile-menu');
  const burger = document.querySelector('.nav-burger');

  /* Scrolled state */
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* aria-current on the active link */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a, .mobile-menu a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.split('#')[0] === page) a.setAttribute('aria-current', 'page');
  });

  /* Mobile overlay menu */
  let lastFocused = null;

  function focusables() {
    return Array.from(menu.querySelectorAll('a[href], button:not([disabled])'));
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

  function openMenu() {
    lastFocused = document.activeElement;
    menu.classList.add('is-open');
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    const close = menu.querySelector('.mobile-menu__close');
    if (close) close.focus();
    document.addEventListener('keydown', onMenuKeydown);
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onMenuKeydown);
    if (lastFocused) lastFocused.focus();
  }

  if (menu && burger) {
    burger.addEventListener('click', openMenu);
    const close = menu.querySelector('.mobile-menu__close');
    if (close) close.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }
})();
