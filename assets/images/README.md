# Images (deploy these)

Only the three folders in this directory ship with the site.

```
assets/images/
  lots/    Auction photography. live-01…live-11, silent-01…silent-13
  site/    Page photography: hero, portraits, Bible illuminations
  logos/   Tupa signature + sponsor marks
```

To swap a lot photo, drop the web-sized JPG into `lots/` using the same filename, or add a new file and update `data/lots.json` and `data/lots.js`.

Original high-res files, designer packets, and unused leftovers live in `_source/` at the repo root. That folder is gitignored so it does not get uploaded.
