// src/components/Header.jsx
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link to="/" className="site-header__title">
          The Sohbet Archive
        </Link>
        <p className="site-header__tagline">
          Talks of Maulana Sheikh Nazim, 1979–2013
        </p>
      </div>
    </header>
  );
}
