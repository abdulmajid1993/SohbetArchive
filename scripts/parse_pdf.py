#!/usr/bin/env python3
"""
Parse the Maulana Sheikh Nazim sohbet-archive PDF into structured JSON.

Source: a web-capture PDF of sufismus-online.de. Every article (real sohbet
OR an auto-generated Category/Origin listing page) begins with a marker of
the form:

    Maulana Sheikh Nazim : <slug>
    ●
    <Human-readable title>

    <body text...>

We use that marker -- not the repeating page-running-header -- to split the
document into articles, because a handful of running headers contain the
human title (with spaces) instead of the slug, which breaks naive
header-based grouping.

Listing pages (Category*, Web*/Book* origin pages) are identified by the
phrase "The following N page(s) belong to X" and are excluded from the
sohbet corpus, but mined for a reliable slug -> categories / slug ->
source-site mapping (more complete than each sohbet's own footer tag line).

Requires poppler-utils (`pdftotext`) on PATH.

Usage:
    python3 parse_pdf.py <input.pdf> <output_dir>
"""
import sys
import os
import re
import json
import subprocess
from collections import defaultdict, Counter

try:
    from langdetect import detect, DetectorFactory
    DetectorFactory.seed = 0
    HAVE_LANGDETECT = True
except ImportError:
    HAVE_LANGDETECT = False

ARTICLE_START_RE = re.compile(
    r'Maulana Sheikh Nazim\s*:\s*(\S+)\s*\n\s*●\s*\n+([^\n]*)\n'
)
INDEX_PAGE_RE = re.compile(r'The following \d+ page\(s\) belong to')
BRACKET_SLUG_RE = re.compile(r'\[([A-Za-z0-9]+)\]')
DATE_LOC_RE = re.compile(
    r'^\s*([A-Za-zÄÖÜäöüß .\'\-]{2,40}),\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})\s*$',
    re.MULTILINE,
)
TAG_LINE_RE = re.compile(
    r'^\s*((?:Category|Web|Book)[A-Za-z0-9]+(?:,\s*(?:Category|Web|Book)[A-Za-z0-9]+)*)\s*$',
    re.MULTILINE,
)
FOOTER_URL_RE = re.compile(
    r'^\s*http://www\.sufismus-online\.de/\S+?\s*\(\d+ von \d+\).*$',
    re.MULTILINE,
)
RUNNING_HEADER_RE = re.compile(r'^\s*Maulana Sheikh Nazim\s*:.*$', re.MULTILINE)
BULLET_LINE_RE = re.compile(r'^\s*●\s*$', re.MULTILINE)


def camel_to_title(slug: str) -> str:
    """Fallback de-camel-caser, used only when no human title was found."""
    s = re.sub(r'(?<!^)(?<![A-Z0-9])(?=[A-Z])', ' ', slug)
    s = re.sub(r'(?<=[a-zA-Z])(?=[0-9])', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def tidy_title(raw_title: str, slug: str) -> str:
    raw_title = raw_title.strip().strip('●').strip()
    if len(raw_title) < 3:
        return camel_to_title(slug)
    if raw_title.isupper():
        return raw_title.title()
    return raw_title


def extract_pdf_text(pdf_path: str) -> str:
    result = subprocess.run(
        ['pdftotext', pdf_path, '-'],
        capture_output=True, check=True,
    )
    return result.stdout.decode('utf-8', errors='replace')


def split_into_articles(full_text: str):
    """Slice the full document text at each article-start marker.
    Returns list of (slug, human_title, raw_text)."""
    matches = list(ARTICLE_START_RE.finditer(full_text))
    articles = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        slug = m.group(1)
        human_title = m.group(2)
        raw = full_text[start:end]
        articles.append((slug, human_title, raw))
    return articles


def dedupe_slugs(articles):
    """Append -2, -3... to any slug that recurs, so no content is dropped."""
    seen = Counter()
    out = []
    for slug, title, raw in articles:
        seen[slug] += 1
        final_slug = slug if seen[slug] == 1 else f'{slug}-{seen[slug]}'
        out.append((final_slug, title, raw))
    return out


def build_index_mappings(articles):
    """From Category*/Web*/Book* listing pages, build slug -> categories
    and slug -> source-site mappings."""
    slug_categories = defaultdict(set)
    slug_source = {}
    index_slugs = set()

    for slug, _title, raw in articles:
        if not INDEX_PAGE_RE.search(raw):
            continue
        base_slug = re.sub(r'-\d+$', '', slug)
        index_slugs.add(slug)
        linked = set(BRACKET_SLUG_RE.findall(raw))
        if base_slug.startswith('Category'):
            category_name = camel_to_title(base_slug[len('Category'):])
            for s in linked:
                slug_categories[s].add(category_name)
        elif base_slug.startswith('Web') or base_slug.startswith('Book'):
            for s in linked:
                slug_source.setdefault(s, base_slug)

    return slug_categories, slug_source, index_slugs


def clean_body(raw: str, slug: str, human_title: str) -> str:
    m = ARTICLE_START_RE.search(raw)
    body = raw[m.end():] if m else raw

    lines = body.split('\n')
    kept = []
    for line in lines:
        if RUNNING_HEADER_RE.match(line):
            continue
        if BULLET_LINE_RE.match(line):
            continue
        if FOOTER_URL_RE.match(line):
            continue
        if DATE_LOC_RE.match(line):
            continue
        if TAG_LINE_RE.match(line):
            continue
        kept.append(line)
    body = '\n'.join(kept)
    body = re.sub(r'\n{3,}', '\n\n', body)
    return body.strip()


def detect_language(body: str) -> str:
    if not HAVE_LANGDETECT:
        return 'unknown'
    sample = body[:2000].strip()
    if len(sample) < 20:
        return 'unknown'
    try:
        return detect(sample)
    except Exception:
        return 'unknown'


def normalize_date(day, month, year):
    try:
        day, month, year = int(day), int(month), int(year)
        if year < 100:
            year += 1900 if year > 50 else 2000
        if not (1 <= month <= 12 and 1 <= day <= 31):
            return None
        return f'{year:04d}-{month:02d}-{day:02d}'
    except ValueError:
        return None


def parse(pdf_path: str, output_dir: str):
    print(f'Extracting text from {pdf_path} ...')
    full_text = extract_pdf_text(pdf_path)

    print('Splitting into articles at title markers ...')
    articles = split_into_articles(full_text)
    print(f'  {len(articles)} article-start markers found')
    articles = dedupe_slugs(articles)

    print('Building category / source-site mappings from index pages ...')
    slug_categories, slug_source, index_slugs = build_index_mappings(articles)
    print(f'  {len(index_slugs)} index/listing pages excluded from content')

    content_articles = [(s, t, r) for s, t, r in articles if s not in index_slugs]
    print(f'  {len(content_articles)} real content articles to process')

    sohbets = []
    stats = Counter()
    lang_counter = Counter()

    for slug, human_title, raw in content_articles:
        stats['total'] += 1

        dm = DATE_LOC_RE.search(raw)
        date, location = None, None
        if dm:
            location = dm.group(1).strip()
            date = normalize_date(dm.group(2), dm.group(3), dm.group(4))
            if date:
                stats['has_date'] += 1
            if location:
                stats['has_location'] += 1

        footer_categories = set()
        source_from_tag = None
        tm = TAG_LINE_RE.search(raw)
        if tm:
            for tok in tm.group(1).split(','):
                tok = tok.strip()
                if tok.startswith('Category'):
                    footer_categories.add(camel_to_title(tok[len('Category'):]))
                elif tok.startswith('Web') or tok.startswith('Book'):
                    source_from_tag = tok

        base_slug = re.sub(r'-\d+$', '', slug)
        categories = sorted(slug_categories.get(base_slug, set()) | footer_categories)
        if categories:
            stats['has_category'] += 1

        source_site = slug_source.get(base_slug, source_from_tag)
        if source_site:
            stats['has_source'] += 1

        body = clean_body(raw, slug, human_title)
        if len(body) < 30:
            stats['suspiciously_short'] += 1
        language = detect_language(body)
        lang_counter[language] += 1

        title = tidy_title(human_title, base_slug)
        source_url = f'http://www.sufismus-online.de/{base_slug}'

        sohbets.append({
            'slug': slug,
            'title': title,
            'date': date,
            'location': location,
            'language': language,
            'categories': categories,
            'sourceSite': source_site,
            'sourceUrl': source_url,
            'wordCount': len(body.split()),
            'body': body,
        })

    os.makedirs(os.path.join(output_dir, 'sohbets'), exist_ok=True)

    index = []
    for s in sohbets:
        entry = {k: v for k, v in s.items() if k != 'body'}
        index.append(entry)
        safe_slug = s['slug'].replace('/', '-')
        with open(os.path.join(output_dir, 'sohbets', f'{safe_slug}.json'), 'w', encoding='utf-8') as f:
            json.dump(s, f, ensure_ascii=False, indent=2)

    with open(os.path.join(output_dir, 'sohbet-index.json'), 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    total = stats['total']
    report = {
        'total_sohbets': total,
        'excluded_index_pages': len(index_slugs),
        'has_date_pct': round(100 * stats['has_date'] / total, 1) if total else 0,
        'has_location_pct': round(100 * stats['has_location'] / total, 1) if total else 0,
        'has_category_pct': round(100 * stats['has_category'] / total, 1) if total else 0,
        'has_source_site_pct': round(100 * stats['has_source'] / total, 1) if total else 0,
        'suspiciously_short_bodies': stats['suspiciously_short'],
        'language_breakdown': dict(lang_counter.most_common()),
        'distinct_categories': len({c for s in sohbets for c in s['categories']}),
    }
    with open(os.path.join(output_dir, 'data-quality-report.json'), 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print()
    print('Done. Data quality report:')
    print(json.dumps(report, indent=2, ensure_ascii=False))

    return report


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: python3 parse_pdf.py <input.pdf> <output_dir>')
        sys.exit(1)
    parse(sys.argv[1], sys.argv[2])
