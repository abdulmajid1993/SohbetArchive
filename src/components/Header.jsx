// src/components/Header.jsx
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import './Header.css';

export default function Header() {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link to="/" className="site-header__brand">
          <img src={logo} alt="" className="site-header__logo" />
          <span>
            <span className="site-header__title">The Sohbet Archive</span>
            <p className="site-header__tagline">
              Talks of Maulana Sheikh Nazim, 1979–2013
            </p>
          </span>
        </Link>
      </div>
    </header>
  );
}
