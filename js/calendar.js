// Add-to-calendar: .ics blob download + Google Calendar link.

const EVENT = {
  title: 'An Evening of Fine Art & Philanthropy featuring Father Jerome Tupa',
  // 4:00–7:30 p.m. Central (CDT, UTC-5) on 2026-10-22
  startUTC: '20261022T210000Z',
  endUTC: '20261023T003000Z',
  location: 'Bacio Restaurant, 1571 Plymouth Road, Minnetonka, Minnesota 55305',
  description: 'A live fundraising auction of original paintings by Father Jerome Tupa, illuminated pages from the St. John\u2019s Bible, pottery by Richard Bresnahan, and an original work by Pablo Picasso \u2014 benefiting St. John\u2019s Abbey & St. John\u2019s University.',
};

function icsString() {
  const esc = (s) => s.replace(/([,;])/g, '\\$1');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jerome Tupa Fine Art//Auction//EN',
    'BEGIN:VEVENT',
    `UID:tupa-auction-2026@jerometupafineart.com`,
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

export function bindCalendarButtons(root = document) {
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
}

bindCalendarButtons();
