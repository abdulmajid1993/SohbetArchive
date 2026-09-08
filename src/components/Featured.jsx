// src/components/Featured.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { topCategories } from '../utils/filters';
import { formatDate, languageLabel } from '../utils/format';
import './Featured.css';

export default function Featured({ sohbets }) {
  const featured = useMemo(() => {
    const wellFormed = sohbets.filter((s) => s.date && s.language === 'en' && s.location);
    const pool = wellFormed.length > 0 ? wellFormed : sohbets;
    return pool[Math.floor(Math.random() * pool.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const subjects = useMemo(() => topCategories(sohbets, 6), [sohbets]);

  return (
    <div className="featured">
      <Link to={`/sohbet/${featured.slug}`} className="featured__card">
        <p className="featured__label">Featured</p>
        <p className="featured__title">{featured.title}</p>
        <p className="featured__meta">
          {formatDate(featured.date)} &middot; {featured.location || 'Unrecorded'} &middot;{' '}
          {languageLabel(featured.language)}
        </p>
      </Link>

      <div>
        <p className="featured__label">Or explore a subject</p>
        <div className="featured__subjects">
          {subjects.map((c) => (
            <Link key={c} to={`/?category=${encodeURIComponent(c)}`} className="featured__subject-pill">
              {c}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
