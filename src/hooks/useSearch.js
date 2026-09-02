// src/hooks/useSearch.js
import { useCallback, useRef, useState } from 'react';
import MiniSearch from 'minisearch';

let indexPromise = null;

function loadSearchIndex() {
  if (!indexPromise) {
    indexPromise = fetch(`${import.meta.env.BASE_URL}search-index.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load search index (${res.status})`);
        return res.json();
      })
      .then((json) =>
        MiniSearch.loadJSAsync(json, {
          idField: 'slug',
          fields: ['title', 'body', 'categories'],
          storeFields: ['title', 'date', 'location', 'language', 'slug'],
        })
      );
  }
  return indexPromise;
}

/**
 * Full-text search across every sohbet's body text.
 * The ~9MB search index is only fetched the first time `search()` is
 * called -- it never loads on initial page view.
 */
export function useSearch() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const miniSearchRef = useRef(null);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return [];
    if (!miniSearchRef.current) {
      setLoading(true);
      miniSearchRef.current = await loadSearchIndex();
      setLoading(false);
      setReady(true);
    }
    return miniSearchRef.current.search(query, {
      boost: { title: 3, categories: 2 },
      fuzzy: 0.2,
      prefix: true,
    });
  }, []);

  return { search, ready, loading };
}
