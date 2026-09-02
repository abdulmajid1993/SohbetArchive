// src/components/FilterBar.jsx
import { UNDATED, UNCATEGORISED } from '../utils/filters';
import { languageLabel } from '../utils/format';
import './FilterBar.css';

function Select({ label, value, onChange, options, renderOption }) {
  return (
    <label className="filter-field">
      <span className="filter-field__label">{label}</span>
      <select
        className="filter-field__select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {renderOption ? renderOption(opt) : opt}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar({ facets, filters, onChange, resultCount, totalCount }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value });

  return (
    <div className="filter-bar">
      <p className="filter-bar__count">
        {resultCount === totalCount
          ? `${totalCount.toLocaleString()} sohbets`
          : `${resultCount.toLocaleString()} of ${totalCount.toLocaleString()} sohbets`}
      </p>

      <Select
        label="Topic"
        value={filters.category}
        onChange={set('category')}
        options={facets.categories}
        renderOption={(c) => (c === UNCATEGORISED ? 'No topic recorded' : c)}
      />
      <Select
        label="Year"
        value={filters.year}
        onChange={set('year')}
        options={facets.years}
        renderOption={(y) => (y === UNDATED ? 'Date unknown' : y)}
      />
      <Select
        label="Location"
        value={filters.location}
        onChange={set('location')}
        options={facets.locations}
        renderOption={(l) => (l === UNDATED ? 'Unrecorded' : l)}
      />
      <Select
        label="Language"
        value={filters.language}
        onChange={set('language')}
        options={facets.languages}
        renderOption={languageLabel}
      />

      {(filters.category || filters.year || filters.location || filters.language) && (
        <button
          type="button"
          className="filter-bar__clear"
          onClick={() => onChange({ category: null, year: null, location: null, language: null })}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
