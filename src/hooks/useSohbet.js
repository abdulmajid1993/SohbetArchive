// src/hooks/useSohbet.js
import { useEffect, useState } from 'react';

const cache = new Map();

/**
 * Lazy-loads one sohbet's full record (including body text) by slug.
 * Nothing here is fetched until a person actually opens that sohbet.
 */
export function useSohbet(slug) {
  const [state, setState] = useState(() =>
    cache.has(slug)
      ? { data: cache.get(slug), loading: false, error: null }
      : { data: null, loading: true, error: null }
  );

  useEffect(() => {
    if (!slug) return;
    if (cache.has(slug)) {
      setState({ data: cache.get(slug), loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetch(`${import.meta.env.BASE_URL}data/sohbets/${encodeURIComponent(slug)}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Sohbet "${slug}" not found (${res.status})`);
        return res.json();
      })
      .then((data) => {
        cache.set(slug, data);
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
