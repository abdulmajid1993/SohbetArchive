// src/pages/BrowsePage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSohbetIndex } from '../hooks/useSohbetIndex';
import { collectFacets, applyFilters, sortSohbets } from '../utils/filters';
import FilterBar from '../components/FilterBar';
import SohbetListItem from '../components/SohbetListItem';
import SearchBox from '../components/SearchBox';
import './BrowsePage.css';

const PAGE_SIZE = 40;

export default function BrowsePage() {
  const { data, loading, error } = useSohbetIndex();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category'),
    year: null,
    location: null,
    language: null,
  });
  const [sortBy, setSortBy] = useState('date-desc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Keep the category filter in sync if someone arrives via a topic link
  // (e.g. from a sohbet's detail page) after the browse page is already mounted.
  useEffect(() => {
    const fromUrl = searchParams.get('category');
    if (fromUrl && fromUrl !== filters.category) {
      setFilters((f) => ({ ...f, category: fromUrl }));
      setVisibleCount(PAGE_SIZE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const facets = useMemo(() => (data ? collectFacets(data) : null), [data]);
  const filtered = useMemo(
    () => (data ? sortSohbets(applyFilters(data, filters), sortBy) : []),
    [data, filters, sortBy]
  );
  const visible = filtered.slice(0, visibleCount);

  function handleFilterChange(next) {
    setFilters(next);
    setVisibleCount(PAGE_SIZE);
    if (next.category) {
      setSearchParams({ category: next.category });
    } else {
      setSearchParams({});
    }
  }

  if (loading) {
    return (
      <div className="shell browse-page">
        <p className="browse-page__status">Loading the archive…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shell browse-page">
        <p className="browse-page__status">
          Couldn't load the archive. Refresh to try again.
        </p>
      </div>
    );
  }

  return (
    <div className="shell browse-page">
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
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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
  );
}
