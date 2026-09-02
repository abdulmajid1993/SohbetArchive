# The Sohbet Archive

A browsable, searchable archive of sohbets (talks) by Maulana Sheikh Nazim,
1979–2013 — sortable by topic, date, location and language, with full-text
search. Built as a static React app: no backend, no database.

"The Sohbet Archive" is a placeholder name — rename freely in
`src/components/Header.jsx` and `index.html`.

## How it's built

- **Data**: `scripts/parse_pdf.py` parses the source PDF archive into
  `public/data/sohbet-index.json` (metadata for all sohbets) and
  `public/data/sohbets/<slug>.json` (one file per sohbet, full text +
  metadata). Already generated — you don't need to re-run this unless the
  source PDF changes.
- **Search**: `scripts/build-search-index.mjs` builds a static full-text
  search index (MiniSearch) over every sohbet's body text, output to
  `public/search-index.json`. The app only fetches this file the first
  time someone actually searches — it's never loaded on first paint.
- **App**: React + Vite + React Router (`HashRouter` — see note below).
  Browse/filter/sort reads the small metadata index; opening a sohbet
  lazy-loads just that one file; search lazy-loads the search index.

Nothing here needs a database or a server. The whole thing is static
files, which is why Hostinger's cheapest static/Node-build tier is enough.

## Local development

```bash
npm install
npm run dev       # http://localhost:5173
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally, for a final check
```

## Regenerating the data (only if the source PDF changes)

```bash
# 1. Parse the PDF into JSON
pip install -r scripts/requirements.txt --break-system-packages
python3 scripts/parse_pdf.py path/to/source.pdf public/data
# (requires poppler-utils installed for `pdftotext` — e.g. `apt install poppler-utils`)

# 2. Rebuild the search index
node scripts/build-search-index.mjs
```

Re-running step 1 will print a data-quality report (% with date, category,
etc.) so you can see at a glance if anything regressed.

## Known data-quality facts (from the source archive, not a bug)

- ~45% of sohbets have a recorded date/location; the rest show "Date
  unknown" / "Unrecorded" — the original archive simply didn't capture
  this for every talk.
- ~98% of dated/located sohbets are from Lefke, Cyprus — location is a
  shallow filter in practice.
- ~85% English, ~14% German. A few sohbets contain both languages in the
  same document (a mid-page language switch) — language tagging on those
  is approximate.
- ~74% of sohbets have at least one topic; the rest show "No topic
  recorded".

## A note on routing

The app uses React Router's `HashRouter` (URLs look like
`yoursite.com/#/sohbet/AdabOfTariqah`), not `BrowserRouter`. This means it
works correctly on any static host with zero server configuration —
no rewrite rules needed for deep links to survive a page refresh.

If you'd rather have clean URLs (`yoursite.com/sohbet/AdabOfTariqah`),
switch to `BrowserRouter` in `src/App.jsx` and add a rewrite rule on
Hostinger so all paths fall back to `index.html`.

## Deploying (GitHub + Hostinger)

1. Push this repo to GitHub.
2. In hPanel, create a new website using Hostinger's Node/React app
   hosting, connect it to this GitHub repo, and point the build command
   at `npm run build` with output directory `dist`.
3. Every push to your main branch will rebuild and redeploy.

`public/data/` and `public/search-index.json` are committed to the repo
(~35MB total) since they're the app's actual content, not build output —
there's nothing to regenerate them from at deploy time unless you change
the source PDF.

## Open items / ideas for later

- German-only sohbets are shown as-is (no linking to an English
  counterpart).
- Source-site attribution is stored in the data (`sourceSite`,
  `sourceUrl`) but not shown in the UI.
- Styling borrows The Inner Way CIC's palette and type (teal, gold,
  Cormorant Garamond, Montserrat) without being formally branded as an
  Inner Way product.
