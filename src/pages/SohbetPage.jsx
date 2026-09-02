// src/pages/SohbetPage.jsx
import { useParams, Link } from 'react-router-dom';
import { useSohbet } from '../hooks/useSohbet';
import { formatDate, languageLabel } from '../utils/format';
import './SohbetPage.css';

export default function SohbetPage() {
  const { slug } = useParams();
  const { data, loading, error } = useSohbet(slug);

  if (loading) {
    return (
      <div className="shell sohbet-page">
        <p className="sohbet-page__status">Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="shell sohbet-page">
        <p className="sohbet-page__status">
          This sohbet couldn't be found. <Link to="/">Back to the archive</Link>
        </p>
      </div>
    );
  }

  return (
    <article className="shell sohbet-page">
      <Link to="/" className="sohbet-page__back">
        ← Back to the archive
      </Link>

      <h1 className="sohbet-page__title">{data.title}</h1>

      <div className="sohbet-page__meta">
        <span className="tag tag--date">{formatDate(data.date)}</span>
        <span className="tag">{data.location || 'Location unrecorded'}</span>
        <span className="tag">{languageLabel(data.language)}</span>
      </div>

      {data.categories.length > 0 && (
        <div className="sohbet-page__topics">
          {data.categories.map((c) => (
            <Link key={c} to={`/?category=${encodeURIComponent(c)}`} className="tag tag--topic">
              {c}
            </Link>
          ))}
        </div>
      )}

      <hr className="sohbet-page__rule" />

      <div className="sohbet-page__body">
        {data.body.split(/\n{2,}/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  );
}
