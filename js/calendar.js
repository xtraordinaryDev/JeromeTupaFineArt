// Add-to-calendar: .ics blob download + Google Calendar link.
// Classic script.

window.Tupa = window.Tupa || {};

(function () {
'use strict';

const EVENT = {
  title: 'An Evening of Fine Art & Philanthropy featuring Father Jerome Tupa',
  // 4:30–9:00 p.m. Central (CDT, UTC-5) on 2026-10-22
  startUTC: '20261022T213000Z',
  endUTC: '20261023T020000Z',
  location: 'The Hutton House, 10715 South Shore Drive, Medicine Lake, Minnesota 55441',
  description: 'A live fundraising auction of original paintings by Father Jerome Tupa, illuminated pages from the St. John\u2019s Bible, pottery by Richard Bresnahan, and an original work by Pablo Picasso \u2014 benefiting St. John\u2019s Abbey & St. John\u2019s University.',
};

function icsString() {
  const esc = (s) => s.replace(/([,;])/g, '\\$1');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jerome Tupa Fine Art//Auction//EN',
    'BEGIN:VEVENT',
    `UID:tupa-auction-2026@tupa.art`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`,
    `DTSTART:${EVENT.startUTC}`,
    `DTEND:${EVENT.endUTC}`,
    `SUMMARY:${esc(EVENT.title)}`,
    `LOCATION:${esc(EVENT.location)}`,
    `DESCRIPTION:${esc(EVENT.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

Tupa.bindCalendarButtons = function (root) {
  root = root || document;
  root.querySelectorAll('[data-ics]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const blob = new Blob([icsString()], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tupa-auction-oct-22-2026.ics';
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  root.querySelectorAll('[data-gcal]').forEach((a) => {
    const q = new URLSearchParams({
      action: 'TEMPLATE',
      text: EVENT.title,
      dates: `${EVENT.startUTC}/${EVENT.endUTC}`,
      location: EVENT.location,
      details: EVENT.description,
    });
    a.href = `https://calendar.google.com/calendar/render?${q}`;
  });
};

Tupa.bindCalendarButtons();

})();
