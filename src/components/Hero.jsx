// src/components/Hero.jsx
import { useEffect, useState } from 'react';
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

export default function Hero({ sohbetCount }) {
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhotoIndex((i) => (i + 1) % HERO_PHOTOS.length);
    }, PHOTO_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero">
      <div className="shell">
        <div className="hero__intro">
          <div>
            <h1 className="hero__headline">A searchable archive of sohbets, 1979&ndash;2013</h1>
            <p className="hero__subline">
              {sohbetCount.toLocaleString()} talks by Maulana Sheikh Nazim, most given in
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
      </div>

      <div className="shell">
        <div className="hero__rule" />
      </div>
    </div>
  );
}
