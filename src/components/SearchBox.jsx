// src/components/SearchBox.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';
import './SearchBox.css';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const { search, loading } = useSearch();
  const boxRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const hits = await search(query);
      if (!cancelled) {
        setResults(hits.slice(0, 8));
        setOpen(true);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-box" ref={boxRef}>
      <input
        type="search"
        className="search-box__input"
        placeholder="Search the full text of every sohbet…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        aria-label="Search sohbets"
      />
      {loading && <span className="search-box__status">Loading search index…</span>}

      {open && results.length > 0 && (
        <ul className="search-box__results">
          {results.map((r) => (
            <li key={r.id}>
              <Link to={`/sohbet/${r.id}`} onClick={() => setOpen(false)}>
                <span className="search-box__result-title">{r.title}</span>
                {r.date && <span className="search-box__result-date">{r.date.slice(0, 4)}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="search-box__empty">No sohbets match "{query}"</div>
      )}
    </div>
  );
}
