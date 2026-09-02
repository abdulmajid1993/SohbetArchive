// scripts/build-search-index.mjs
//
// Builds a static full-text search index over every sohbet, using MiniSearch.
// Run this once after parse_pdf.py has produced public/data/sohbets/*.json.
// The result (public/search-index.json) is fetched lazily by the app only
// when the person opens the search box -- it is never bundled into the
// main JS, and never loaded on first paint.
//
// Usage: node scripts/build-search-index.mjs

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import MiniSearch from 'minisearch';

const SOHBETS_DIR = join(process.cwd(), 'public', 'data', 'sohbets');
const OUTPUT_PATH = join(process.cwd(), 'public', 'search-index.json');

const files = readdirSync(SOHBETS_DIR).filter((f) => f.endsWith('.json'));
console.log(`Indexing ${files.length} sohbets ...`);

const miniSearch = new MiniSearch({
  idField: 'slug',
  fields: ['title', 'body', 'categories'],
  storeFields: ['title', 'date', 'location', 'language', 'slug'],
  searchOptions: {
    boost: { title: 3, categories: 2 },
    fuzzy: 0.2,
    prefix: true,
  },
});

const documents = files.map((file) => {
  const raw = JSON.parse(readFileSync(join(SOHBETS_DIR, file), 'utf-8'));
  return {
    slug: raw.slug,
    title: raw.title,
    body: raw.body,
    categories: raw.categories.join(' '),
    date: raw.date,
    location: raw.location,
    language: raw.language,
  };
});

miniSearch.addAll(documents);

const json = JSON.stringify(miniSearch);
writeFileSync(OUTPUT_PATH, json);

const sizeMB = (statSync(OUTPUT_PATH).size / (1024 * 1024)).toFixed(2);
console.log(`Wrote ${OUTPUT_PATH} (${sizeMB} MB)`);
