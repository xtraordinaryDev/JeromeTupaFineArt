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
  images/lots-cropped/  web-sized auction photos, white backdrops trimmed (live-01 … silent-13) — the set the site loads
  images/lots/          the untrimmed originals of the same 32 filenames, kept for reference
  images/site/    hero, portraits, Bible illuminations
  images/logos/   Tupa signature + sponsor marks
  fonts/          Encorpada Classic Compressed
  brand/          wall.svg (view-in-room) + leftover brand SVGs
_source/    originals, designer files, unused photos — gitignored, not deployed
```

Header/footer markup is static in each page (kept in sync by hand) rather than JS-injected, so navigation works without JavaScript.

## Real content already in place

- **Logo:** the real white signature logo (`assets/images/logo-tupa-white.png`) is used in the nav on every page (rendered dark via CSS filter on light nav bars) and in the artist-page quote moment.
- **Photography:** live and silent lots use web-sized photos in `assets/images/lots-cropped/`. Site photography (hero, portraits, illuminations) is in `assets/images/site/`. Live Lot 07 (*The Face of Hope*) still uses a stand-in until the client supplies that painting.
- **Note:** Tupa lot titles, years and dimensions are descriptive placeholders written from the photos — confirm the final lot list with the client.
- **Sponsor logos:** all five marks are now the real artwork — Fidelis Capital, Saint John's Abbey, Saint John's University, The Saint John's Bible and Bacio. Each is drawn in ink on transparency so the footer's invert filter renders it light on dark; a light-on-transparent original would need that filter revisited.
  `logos/sju.png` is derived from the client's `logos/stjohnslogo.png` (kept as the untouched supply): the white ground was converted to alpha, the mark trimmed, then re-padded by 22% of its height so it carries the same optical margin as the neighbouring marks and does not dominate the sponsor row. The wordmark is only 128 px tall at source, which is marginal for the 4 rem slot on a 2× display — **ask the client for vector or higher-resolution artwork.**
- **Bacio:** `logos/bacio.webp` (transparent, 400 × 71) appears as a sponsor, on the menu page, and inline in both programmes via `.inline-logo`. On the teal invite panel `.inline-logo--invert` knocks it back to a white silhouette; on the black menu page it keeps its colour on a white plaque.
- **Menu page:** `menu.html` is live with a placeholder card (`.menu-sheet__pending`). When the client sends the menu, replace that `<div>` with `<img src="assets/images/site/menu.jpg" alt="…">` inside the same `<figure class="menu-sheet">`.
- **The printed invitation:** the homepage teaser is a linen envelope with the 7 × 7 card peeking out. `.invite-opener` is a link to `assets/tupa-gala-invitation.pdf` that `js/invitation.js` upgrades into `#invitation-viewer`. The overlay opens the envelope, draws the card (front and back), then unfolds the zig-zag booklet one fold at a time — matching the physical mailer (card on top, accordion booklet behind it). Without JavaScript the link just opens the card PDF.
  The card files are generated from `assets/More Tupa Website Black Direction pages/Tupa 7 x 7 Invitation Card V2 Update.ai`: `images/site/invitation-front.jpg`, `images/site/invitation-back.jpg` and `assets/tupa-gala-invitation.pdf`. The booklet panels in `images/site/zigzag/` (`a1`–`a6` one side, `b1`–`b6` the other) and `assets/tupa-gala-booklet.pdf` come from `Tupa Zig Zag Invitation Booklet PA.ai`. Re-render them together if either file is revised (`python .tmp-preview/render_invite.py` is the current recipe). Keep the `alt` text on both card faces and every panel in step with the artwork, since it is the only way a screen reader gets the content.
- **Films about the Bible:** the Today Show and PBS NewsHour pieces run as `.film-card` thumbnails (a shared component in `components.css`) beneath the first image on `bible.html` and on the two Edition lot pages. On lot pages they come from an optional `videos` array in the lot data (`title`, `source`, `url`, `poster`) that `initFilms` in `js/lot.js` reads; add the array to any other lot to give it a film row. Poster frames are local copies in `images/site/bible-video-*.jpg` so nothing depends on YouTube's CDN — re-pull them if either video is replaced.

## Swapping in remaining real content

- **Artwork photography:** drop web-sized JPGs into `assets/images/lots-cropped/` — that is the folder the site loads, so a re-crop dropped in under the same filename goes live with no code change. Keep the `images` paths in `data/lots.js` and `lots.json` in sync. Untouched camera originals belong in `_source/`, not in `assets/`.
  Cards and lot pages use `object-fit: contain` on a transparent frame, so a photo trimmed to the artwork edge letterboxes into the black page rather than being cut off — tighter crops are always safe. Note that the Saint John's Bible folios (`live-10-word-made-flesh`, `live-10-tree-of-life`, `silent-10-b`, `silent-11`, `silent-12`, `silent-13`) keep their pale vellum margins on purpose; that white is the page, not a backdrop.
- **Lot data:** `data/lots.js` (a classic script setting `window.TUPA_LOTS`) feeds the catalogue, lot pages, home rail and artist gallery; `data/lots.json` mirrors it for reference. Edit both or re-run the generator.
  Heads-up: the client swapped live lots 10 and 11 after the photographs were named, so the numeric prefix on four filenames is now stale — Lot 10 (Apostles Edition) loads `live-11-apostles-*.jpg` and Lot 11 (Gospels and Acts) loads `live-10-word-made-flesh.jpg` / `live-10-tree-of-life.jpg`. The descriptive half of each filename is still correct; go by that, not by the number.
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
9. Vector or higher-resolution Saint John's University artwork (the supplied PNG is 128 px tall)
10. Final 7×7 invitation card — V2 is live (`Tupa 7 x 7 Invitation Card V2 Update.ai`, reverse now reads worksofheart.us); the client said a final card may still follow
11. Impact language for The Cause page, and the paragraph replacing "Founded in 1856…" (both awaiting approval)
