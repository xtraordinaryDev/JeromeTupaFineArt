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
index.html / auction.html / lot.html / artist.html
event.html / collection.html / support.html / 404.html
css/        tokens, base, layout, components, motion + pages/*.css
js/         focused classic scripts (reveal, nav, countdown, catalogue,
            lot, rsvp, calendar, cursor, rail, parallax, marquee, data)
data/       lots.js (embedded catalogue data), lots.json (same data as JSON),
            site.json (event/venue/sponsors reference)
assets/     images/ - real photography & logos (client-supplied)
            brand/ and lots/ - generated placeholders (remaining lots)
scripts/    generate-art.mjs - regenerates placeholder art + lots.json
images/     original client-supplied files (source; not referenced by pages)
```

Header/footer markup is static in each page (kept in sync by hand) rather than JS-injected, so navigation works without JavaScript.

## Real content already in place

- **Logo:** the real white signature logo (`assets/images/logo-tupa-white.png`) is used in the nav on every page (rendered dark via CSS filter on light nav bars) and in the artist-page quote moment.
- **Photography:** all 11 Tupa lots (lots 1–11), all 3 Bresnahan pottery lots (14–16), the Picasso *Toros en Vallauris* linocut (lot 17) and Yusuf's *Three Seated Women* (lot 18) use real client-supplied photos from `assets/images/`. Only the two Saint John's Bible folios (12–13) and two private-collection paintings (19–20) still use generated placeholders. Three photos of Father Tupa appear on the home artist teaser, the artist-page hero and biography; *Silver Palace Tiles* is the home-page hero.
- **Note:** Tupa lot titles, years and dimensions are descriptive placeholders written from the photos — confirm the final lot list with the client.
- **Sponsor logos:** Fidelis Capital, Saint John's Abbey and The Saint John's Bible are real; Saint John's University is still a placeholder.

## Swapping in remaining real content

- **Artwork photography:** drop real images into `assets/images/` and update the `images` paths in `data/lots.js` (and `lots.json`). Lots with an empty `images` array render a typographic placeholder card, never a broken image. The generator supports a `realImages` field so re-running it keeps real photos.
- **Lot data:** `data/lots.js` (a classic script setting `window.TUPA_LOTS`) feeds the catalogue, lot pages, home rail and artist gallery; `data/lots.json` mirrors it for reference. Edit both or re-run the generator.
- **RSVP endpoint:** set the real Formspree (or other) endpoint in the `data-endpoint` attribute of the form in `event.html`.
- **Display font:** Abril Fatface is a stand-in. Buy/collect the **Encorpada Classic Compressed** webfont (MyFonts), place woff2 files in `assets/fonts/`, and add the `@font-face` at the top of `css/base.css` (TODO comment marks the spot).
- **PSD files:** `images/Father Tupa Portrait.psd` and `images/Tupa Black logo.psd` can't be shown in a browser - export them as JPG/PNG to use them.
- **Wall photo for "View in room":** `assets/brand/wall.svg` encodes a scale contract (image width = 160 real-world inches, floor line 80 in from top). If you replace it with a photograph, keep or update those constants in `js/lot.js` (`WALL`).

Artist biography, quotes, exhibition history and contact details on the artist/home pages are sourced from the official site, https://tupa.art/ (About page).

## Open questions for the client

1. Encorpada Classic Compressed webfont license files
2. High-res photography for the remaining lots + final lot list with estimates (lot 002 resolved)
3. Online/absentee bidding? (v1 = RSVP + register-interest only)
4. ~~Condition-report contact~~ - resolved: sales@tupa.art / (320) 443-5799, from the artist's official site (tupa.art)
5. Picasso image licensing (currently typographic treatment, per spec)
6. RSVP destination - Formspree vs. client email/CRM
7. Run-of-show times (program timeline on event.html is marked TODO)
8. Buyer's premium / shipping terms wording
9. Saint John's University logo file (only sponsor still using a placeholder)
