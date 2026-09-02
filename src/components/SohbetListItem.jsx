// src/components/SohbetListItem.jsx
import { Link } from 'react-router-dom';
import { formatDate, languageLabel } from '../utils/format';
import './SohbetListItem.css';

export default function SohbetListItem({ sohbet }) {
  return (
    <li className="sohbet-row">
      <Link to={`/sohbet/${sohbet.slug}`} className="sohbet-row__link">
        <h3 className="sohbet-row__title">{sohbet.title}</h3>
        <div className="sohbet-row__meta">
          <span className="tag tag--date">{formatDate(sohbet.date)}</span>
          <span className="tag">{sohbet.location || 'Unrecorded'}</span>
          <span className="tag">{languageLabel(sohbet.language)}</span>
          {sohbet.categories.slice(0, 3).map((c) => (
            <span key={c} className="tag tag--topic">{c}</span>
          ))}
        </div>
      </Link>
    </li>
  );
}
