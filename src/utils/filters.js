// src/utils/filters.js

export const UNDATED = '__undated__';
export const UNCATEGORISED = 'Uncategorised';

export function getYear(sohbet) {
  return sohbet.date ? sohbet.date.slice(0, 4) : UNDATED;
}

export function collectFacets(sohbets) {
  const years = new Set();
  const locations = new Set();
  const languages = new Set();
  const categories = new Set();

  for (const s of sohbets) {
    years.add(getYear(s));
    locations.add(s.location || UNDATED);
    languages.add(s.language || 'unknown');
    if (s.categories.length === 0) categories.add(UNCATEGORISED);
    for (const c of s.categories) categories.add(c);
  }

  const sortYears = (a, b) => {
    if (a === UNDATED) return 1;
    if (b === UNDATED) return -1;
    return b.localeCompare(a); // newest first
  };

  return {
    years: [...years].sort(sortYears),
    locations: [...locations].sort((a, b) =>
      a === UNDATED ? 1 : b === UNDATED ? -1 : a.localeCompare(b)
    ),
    languages: [...languages].sort(),
    categories: [...categories].sort((a, b) =>
      a === UNCATEGORISED ? 1 : b === UNCATEGORISED ? -1 : a.localeCompare(b)
    ),
  };
}

export function applyFilters(sohbets, { year, location, language, category }) {
  return sohbets.filter((s) => {
    if (year && getYear(s) !== year) return false;
    if (location && (s.location || UNDATED) !== location) return false;
    if (language && (s.language || 'unknown') !== language) return false;
    if (category) {
      if (category === UNCATEGORISED) {
        if (s.categories.length !== 0) return false;
      } else if (!s.categories.includes(category)) {
        return false;
      }
    }
    return true;
  });
}

export function sortSohbets(sohbets, sortBy) {
  const copy = [...sohbets];
  switch (sortBy) {
    case 'date-asc':
      return copy.sort((a, b) => (a.date || '0').localeCompare(b.date || '0'));
    case 'date-desc':
      return copy.sort((a, b) => (b.date || '0').localeCompare(a.date || '0'));
    case 'title':
    default:
      return copy.sort((a, b) => a.title.localeCompare(b.title));
  }
}
