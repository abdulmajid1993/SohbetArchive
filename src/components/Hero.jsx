// src/components/Hero.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { topCategories } from '../utils/filters';
import { formatDate, languageLabel } from '../utils/format';
import SearchBox from './SearchBox';
import heroPhoto1 from '../assets/hero/photo-1.jpg';
import heroPhoto2 from '../assets/hero/photo-2.jpg';
import heroPhoto3 from '../assets/hero/photo-3.jpg';
import heroPhoto4 from '../assets/hero/photo-4.jpg';
import heroPhoto5 from '../assets/hero/photo-5.jpg';
import heroPhoto6 from '../assets/hero/photo-6.jpg';
import './Hero.css';

const HERO_PHOTOS = [heroPhoto1, heroPhoto2, heroPhoto3, heroPhoto4, heroPhoto5, heroPhoto6];
const PHOTO_INTERVAL_MS = 6000;

export default function Hero({ sohbets }) {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhotoIndex((i) => (i + 1) % HERO_PHOTOS.length);
    }, PHOTO_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

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
          <div className="hero__photo-frame">
            {HERO_PHOTOS.map((src, i) => (
              <img
                key={src}
                className={`hero__photo${i === photoIndex ? ' is-active' : ''}`}
                src={src}
                alt="Maulana Sheikh Nazim"
                aria-hidden={i === photoIndex ? undefined : true}
              />
            ))}
          </div>
        </div>

        <div className="hero__search">
          <SearchBox />
        </div>

        <div className="hero__links">
          <Link to={`/sohbet/${featured.slug}`} className="hero__featured-card">
            <p className="hero__label">Begin with</p>
            <p className="hero__featured-title">{featured.title}</p>
            <p className="hero__featured-meta">
              {formatDate(featured.date)} &middot; {featured.location || 'Unrecorded'} &middot;{' '}
              {languageLabel(featured.language)}
            </p>
          </Link>

          <div>
            <p className="hero__label">Or explore a subject</p>
            <div className="hero__subjects">
              {subjects.map((c) => (
                <Link key={c} to={`/?category=${encodeURIComponent(c)}`} className="hero__subject-pill">
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="shell">
        <div className="hero__rule" />
      </div>
    </div>
  );
}
