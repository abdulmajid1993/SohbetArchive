// src/utils/format.js

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDate(isoDate) {
  if (!isoDate) return 'Date unknown';
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function languageLabel(code) {
  const labels = { en: 'English', de: 'German' };
  return labels[code] || (code === 'unknown' ? 'Unknown' : code.toUpperCase());
}
