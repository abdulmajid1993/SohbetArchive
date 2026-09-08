// src/pages/BrowsePage.jsx
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSohbetIndex } from '../hooks/useSohbetIndex';
import { collectFacets, applyFilters, sortSohbets } from '../utils/filters';
import FilterBar from '../components/FilterBar';
import SohbetListItem from '../components/SohbetListItem';
import SearchBox from '../components/SearchBox';
import Hero from '../components/Hero';
import './BrowsePage.css';

const PAGE_SIZE = 40;
const DEFAULT_SORT = 'date-desc';

export default function BrowsePage() {
  const { data, loading, error } = useSohbetIndex();
  const [searchParams, setSearchParams] = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters and sort live entirely in the URL (not component state), so they
  // survive navigating to a sohbet and back -- a fresh mount just reads
  // whatever's already in the query string instead of resetting to defaults.
  const filters = useMemo(
    () => ({
      category: searchParams.get('category'),
      year: searchParams.get('year'),
      location: searchParams.get('location'),
      language: searchParams.get('language'),
    }),
    [searchParams]
  );
  const sortBy = searchParams.get('sort') || DEFAULT_SORT;

  const facets = useMemo(() => (data ? collectFacets(data) : null), [data]);
  const filtered = useMemo(
    () => (data ? sortSohbets(applyFilters(data, filters), sortBy) : []),
    [data, filters, sortBy]
  );
  const visible = filtered.slice(0, visibleCount);

  function updateParams(patch) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    setSearchParams(params);
  }

  function handleFilterChange(next) {
    updateParams(next);
    setVisibleCount(PAGE_SIZE);
  }

  function handleSortChange(next) {
    updateParams({ sort: next === DEFAULT_SORT ? null : next });
  }

  if (loading) {
    return (
      <div className="shell browse-page__body">
        <p className="browse-page__status">Loading the archive…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shell browse-page__body">
        <p className="browse-page__status">
          Couldn't load the archive. Refresh to try again.
        </p>
      </div>
    );
  }

  return (
    <div className="browse-page">
      <Hero sohbets={data} />
      <div className="shell browse-page__body">
        <div className="browse-page__toolbar">
          <SearchBox />
          <button
            type="button"
            className="browse-page__filter-toggle"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            {filtersOpen ? 'Hide filters' : 'Filters'}
          </button>
        </div>

        <div className="browse-page__layout">
          <aside className={`browse-page__filters ${filtersOpen ? 'is-open' : ''}`}>
            <FilterBar
              facets={facets}
              filters={filters}
              onChange={handleFilterChange}
              resultCount={filtered.length}
              totalCount={data.length}
            />
          </aside>

          <div className="browse-page__list-column">
            <div className="browse-page__sort">
              <label>
                Sort by{' '}
                <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
                  <option value="date-desc">Newest first</option>
                  <option value="date-asc">Oldest first</option>
                  <option value="title">Title, A–Z</option>
                </select>
              </label>
            </div>

            {filtered.length === 0 ? (
              <p className="browse-page__status">
                No sohbets match these filters. Try clearing one.
              </p>
            ) : (
              <>
                <ul className="browse-page__list">
                  {visible.map((s) => (
                    <SohbetListItem key={s.slug} sohbet={s} />
                  ))}
                </ul>
                {visibleCount < filtered.length && (
                  <button
                    type="button"
                    className="browse-page__load-more"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  >
                    Show more ({filtered.length - visibleCount} remaining)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
