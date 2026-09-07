// src/components/Hero.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { topCategories } from '../utils/filters';
import { formatDate, languageLabel } from '../utils/format';
import shaykhNazimPhoto from '../assets/shaykh-nazim.jpg';
import './Hero.css';

export default function Hero({ sohbets }) {
  const featured = useMemo(() => {
    const wellFormed = sohbets.filter((s) => s.date && s.language === 'en' && s.location);
    const pool = wellFormed.length > 0 ? wellFormed : sohbets;
    return pool[Math.floor(Math.random() * pool.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const subjects = useMemo(() => topCategories(sohbets, 6), [sohbets]);

  return (
    <div className="hero">
      <div className="shell">
        <div className="hero__intro">
          <div>
            <h1 className="hero__headline">A searchable archive of sohbets, 1979&ndash;2013</h1>
            <p className="hero__subline">
              {sohbets.length.toLocaleString()} talks by Maulana Sheikh Nazim, most given in
              Lefke, Cyprus &mdash; in English and German, searchable in full text.
            </p>
          </div>
          <img
            className="hero__photo"
            src={shaykhNazimPhoto}
            alt="Maulana Sheikh Nazim"
          />
        </div>

        <div className="hero__links">
          <div>
            <p className="hero__label">Begin with</p>
            <Link to={`/sohbet/${featured.slug}`} className="hero__featured-title">
              {featured.title}
            </Link>
            <p className="hero__featured-meta">
              {formatDate(featured.date)} &middot; {featured.location || 'Unrecorded'} &middot;{' '}
              {languageLabel(featured.language)}
            </p>
          </div>

          <div>
            <p className="hero__label">Or explore a subject</p>
            <p className="hero__subjects">
              {subjects.map((c, i) => (
                <span key={c}>
                  <Link to={`/?category=${encodeURIComponent(c)}`}>{c}</Link>
                  {i < subjects.length - 1 && <span className="hero__subjects-sep"> &middot; </span>}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      <div className="shell">
        <div className="hero__rule" />
      </div>
    </div>
  );
}
