// src/hooks/useSohbetIndex.js
import { useEffect, useState } from 'react';

let cache = null;
let inflight = null;

function loadIndex() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch(`${import.meta.env.BASE_URL}data/sohbet-index.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load sohbet index (${res.status})`);
        return res.json();
      })
      .then((data) => {
        cache = data;
        return data;
      });
  }
  return inflight;
}

/**
 * Loads the full metadata index (no body text) for every sohbet.
 * Cached after first load -- ~700KB, safe to keep in memory for the session.
 */
export function useSohbetIndex() {
  const [state, setState] = useState(() =>
    cache ? { data: cache, loading: false, error: null } : { data: null, loading: true, error: null }
  );

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    loadIndex()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
