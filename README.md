# Father Jerome Tupa Auction - Event Microsite

Premium single-event auction site for **"An Evening of Fine Art & Philanthropy featuring Father Jerome Tupa"** - Thursday, October 22, 2026, The Hutton House, Medicine Lake, MN. Benefiting St. John's Abbey & St. John's University.

Static site: plain HTML5, hand-written CSS, vanilla JavaScript. No frameworks, no build step, zero runtime dependencies.

## Run locally

No build step and no server required - double-click any `.html` file, or upload the whole folder to any static host (GoDaddy, Netlify, GitHub Pages, ...). All JavaScript is classic (non-module) scripts and the lot data is embedded in `data/lots.js`, so nothing depends on `fetch` or a web server.

A local server still works fine too, if you prefer:

```bash
npx serve .
# or
python -m http.server 8000
```

## Structure

```
index.html / auction.html / lot.html / artist.html / bible.html
event.html / menu.html / collection.html / support.html / 404.html
css/        tokens, base, layout, components, motion + pages/*.css
js/         classic scripts (reveal, nav, countdown, catalogue, lot, …)
data/       lots.js (embedded catalogue), lots.json, site.json
assets/
  images/lots/    web-sized auction photos (live-01 … silent-13)
  images/site/    hero, portraits, Bible illuminations
  images/logos/   Tupa signature + sponsor marks
  fonts/          Encorpada Classic Compressed
  brand/          wall.svg (view-in-room) + leftover brand SVGs
_source/    originals, designer files, unused photos — gitignored, not deployed
```

Header/footer markup is static in each page (kept in sync by hand) rather than JS-injected, so navigation works without JavaScript.

## Real content already in place

- **Logo:** the real white signature logo (`assets/images/logo-tupa-white.png`) is used in the nav on every page (rendered dark via CSS filter on light nav bars) and in the artist-page quote moment.
- **Photography:** live and silent lots use web-sized photos in `assets/images/lots/`. Site photography (hero, portraits, illuminations) is in `assets/images/site/`. Live Lot 07 (*The Face of Hope*) still uses a stand-in until the client supplies that painting.
- **Note:** Tupa lot titles, years and dimensions are descriptive placeholders written from the photos — confirm the final lot list with the client.
- **Sponsor logos:** Fidelis Capital, Saint John's Abbey, The Saint John's Bible and Bacio are the real marks. `logos/sju.svg` (Saint John's University) is a typographic stand-in — replace that file in place, keeping the filename, when the client supplies the artwork. It is drawn in ink so the footer's invert filter renders it light on dark; a light-on-transparent original will need that filter revisited.
- **Bacio:** `logos/bacio.webp` (transparent, 400 × 71) appears as a sponsor, on the menu page, and inline in both programmes via `.inline-logo`. On the teal invite panel `.inline-logo--invert` knocks it back to a white silhouette; on the black menu page it keeps its colour on a white plaque.
- **Menu page:** `menu.html` is live with a placeholder card (`.menu-sheet__pending`). When the client sends the menu, replace that `<div>` with `<img src="assets/images/site/menu.jpg" alt="…">` inside the same `<figure class="menu-sheet">`.

## Swapping in remaining real content

- **Artwork photography:** drop web-sized JPGs into `assets/images/lots/` and update the `images` paths in `data/lots.js` (and `lots.json`). Keep the two files in sync. Originals belong in `_source/`, not in `assets/`.
- **Lot data:** `data/lots.js` (a classic script setting `window.TUPA_LOTS`) feeds the catalogue, lot pages, home rail and artist gallery; `data/lots.json` mirrors it for reference. Edit both or re-run the generator.
- **RSVP endpoint:** set the real Formspree (or other) endpoint in the `data-endpoint` attribute of the form in `event.html`.
- **Display font:** Abril Fatface is a stand-in. Buy/collect the **Encorpada Classic Compressed** webfont (MyFonts), place woff2 files in `assets/fonts/`, and add the `@font-face` at the top of `css/base.css` (TODO comment marks the spot).
- **PSD files:** `images/Father Tupa Portrait.psd` and `images/Tupa Black logo.psd` can't be shown in a browser - export them as JPG/PNG to use them.
- **Wall photo for "View in room":** `assets/brand/wall.svg` encodes a scale contract (image width = 160 real-world inches, floor line 80 in from top). If you replace it with a photograph, keep or update those constants in `js/lot.js` (`WALL`).

Artist biography, exhibition history and contact details on the artist/home pages are sourced from the official site, https://tupa.art/ (About page).

**Quotes are restricted.** Only the four client-approved Fr. Jerome Tupa quotes in `data/site.json` (`approvedQuotes`) may appear anywhere on the site. Do not quote him from tupa.art or any other source; paraphrase into narrative prose instead.

## Open questions for the client

1. Encorpada Classic Compressed webfont license files
2. High-res photography for the remaining lots + final lot list with estimates (lot 002 resolved)
3. Online/absentee bidding? (v1 = RSVP + register-interest only)
4. ~~Condition-report contact~~ - resolved: John@JohnPellegrene.com, from the artist's official site (tupa.art)
5. Picasso image licensing (currently typographic treatment, per spec)
6. RSVP destination - Formspree vs. client email/CRM
7. Run-of-show times (program timeline on event.html is marked TODO)
8. Buyer's premium / shipping terms wording
