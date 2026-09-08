// src/pages/SohbetPage.jsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSohbet } from '../hooks/useSohbet';
import { formatDate, languageLabel } from '../utils/format';
import './SohbetPage.css';

// Returning to "/" would drop any filters the user had applied. Going back
// in history instead lands on the exact URL (filters and all) they came
// from -- falling back to "/" only when there's nowhere in-app to go back to.
function useBackToArchive() {
  const navigate = useNavigate();
  return () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };
}

export default function SohbetPage() {
  const { slug } = useParams();
  const { data, loading, error } = useSohbet(slug);
  const backToArchive = useBackToArchive();

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
          This sohbet couldn't be found.{' '}
          <button type="button" className="sohbet-page__back-link" onClick={backToArchive}>
            Back to the archive
          </button>
        </p>
      </div>
    );
  }

  return (
    <article className="shell sohbet-page">
      <button type="button" className="sohbet-page__back" onClick={backToArchive}>
        ← Back to the archive
      </button>

      <h1 className="sohbet-page__title">{data.title}</h1>

      <div className="sohbet-page__meta">
        <span className="tag">{formatDate(data.date)}</span>
        <span className="tag">{data.location || 'Location unrecorded'}</span>
        <span className="tag">{languageLabel(data.language)}</span>
      </div>

      {data.categories.length > 0 && (
        <div className="sohbet-page__topics">
          {data.categories.map((c) => (
            <Link key={c} to={`/?category=${encodeURIComponent(c)}`} className="tag">
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
