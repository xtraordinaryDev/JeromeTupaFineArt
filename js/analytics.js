// Visitor analytics. One place to switch providers; every page loads this file.
// Fill in exactly ONE of the IDs below and the matching tracker is injected.
// Leave all three empty and nothing is loaded. Never runs when the site is
// opened from a local file, so previews don't pollute the numbers.
(function () {
  'use strict';

  const CLOUDFLARE_TOKEN = '';      // Cloudflare Web Analytics: the "token" value from its snippet
  const PLAUSIBLE_DOMAIN = '';      // Plausible: the site's domain as registered, e.g. 'worksofheart.us'
  const GA4_MEASUREMENT_ID = '';    // Google Analytics 4: e.g. 'G-XXXXXXXXXX'

  if (location.protocol === 'file:') return;
  if (/^(localhost|127\.)/.test(location.hostname)) return;

  const script = (src, attrs) => {
    const s = document.createElement('script');
    s.src = src; s.defer = true;
    Object.entries(attrs || {}).forEach(([k, v]) => s.setAttribute(k, v));
    document.head.appendChild(s);
  };

  if (CLOUDFLARE_TOKEN) {
    script('https://static.cloudflareinsights.com/beacon.min.js',
      { 'data-cf-beacon': JSON.stringify({ token: CLOUDFLARE_TOKEN }) });
  } else if (PLAUSIBLE_DOMAIN) {
    script('https://plausible.io/js/script.js', { 'data-domain': PLAUSIBLE_DOMAIN });
  } else if (GA4_MEASUREMENT_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID, { anonymize_ip: true });
    script('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_MEASUREMENT_ID));
  }
})();
