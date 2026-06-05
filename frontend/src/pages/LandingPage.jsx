import { BriefcaseBusiness, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    title: 'Employee',
    description: 'View assigned tasks and submit daily completion updates.',
    to: ROUTES.EMPLOYEE_LOGIN,
    icon: UserRound,
    buttonLabel: 'Employee login'
  }
]);

export function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="brand-block">
          <span className="brand-mark">ET</span>
          <div>
            <p className="brand-name">Employee Tasks</p>
            <p className="brand-caption">Daily task management</p>
          </div>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <div className="landing-icon">
            <BriefcaseBusiness size={24} aria-hidden="true" />
          </div>
          <p className="eyebrow">Employee Daily Task Management</p>
          <h1 id="landing-title">Employee Tasks</h1>
          <p className="landing-summary">
            Choose your workspace to continue into the secure dashboard built for daily assignments,
            updates, and review.
          </p>
        </div>

        <div className="landing-options" aria-label="Choose login type">
          {accessOptions.map((option) => {
            const Icon = option.icon;

            return (
              <article className="access-card" key={option.to}>
                <div className="access-icon">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <div>
                  <h2>{option.title}</h2>
                  <p>{option.description}</p>
                </div>
                <Link className="primary-button access-link" to={option.to}>
                  <LogIn size={17} aria-hidden="true" />
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
