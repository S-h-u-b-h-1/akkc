import { Link } from 'react-router-dom';

import { ROUTES } from '../constants/routes.js';

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="content-panel compact">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <Link className="primary-button link-button" to={ROUTES.DASHBOARD}>
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
