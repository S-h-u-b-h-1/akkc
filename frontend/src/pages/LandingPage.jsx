import {
  LogIn,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { BrandLogo } from '../components/BrandLogo.jsx';
import { FIRM } from '../constants/firm.js';
import { ROUTES } from '../constants/routes.js';

const accessOptions = Object.freeze([
  {
    title: 'Admin',
    description: 'Manage employees, assign work, and review daily task progress.',
    to: ROUTES.ADMIN_LOGIN,
    icon: ShieldCheck,
    buttonLabel: 'Admin login'
  },
  {
    title: 'Staff',
    description: 'Work through assigned client filings, reviews, and daily follow-ups.',
    to: ROUTES.EMPLOYEE_LOGIN,
    icon: UserRound,
    buttonLabel: 'Staff login'
  }
]);

export function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <BrandLogo className="brand-block" />
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <div className="landing-icon">
            <img src={FIRM.LOGO_URL} alt="CA logo" loading="eager" referrerPolicy="no-referrer" />
          </div>
          <p className="eyebrow">{FIRM.TAGLINE}</p>
          <h1 id="landing-title">{FIRM.NAME}</h1>
          <p className="landing-summary">
            Built on trust, driven by excellence, and committed to empowering businesses with strategic financial solutions and lasting partnerships.
          </p>
        </div>
      </section>

      <section className="landing-options-section">
        <div className="landing-options" aria-label="Choose login type">
          {accessOptions.map((option) => {
            const Icon = option.icon;

            return (
              <article className="access-card" key={option.to}>
                <div className="access-icon">
                  <Icon size={26} aria-hidden="true" />
                </div>
                <div>
                  <h2>{option.title}</h2>
                  <p>{option.description}</p>
                </div>
                <Link className="primary-button access-link" to={option.to}>
                  <LogIn size={18} aria-hidden="true" />
                  <span>{option.buttonLabel}</span>
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
