import {
  BadgeIndianRupee,
  Building2,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Landmark,
  LogIn,
  ReceiptText,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

const useCases = Object.freeze([
  { label: 'GST returns', icon: ReceiptText },
  { label: 'Tax audits', icon: ClipboardCheck },
  { label: 'Income-tax filings', icon: BadgeIndianRupee },
  { label: 'TDS follow-ups', icon: FileSpreadsheet },
  { label: 'ROC compliance', icon: Landmark },
  { label: 'Client documents', icon: FileText }
]);

export function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="brand-block">
          <span className="brand-mark">AK</span>
          <div>
            <p className="brand-name">{FIRM.NAME}</p>
            <p className="brand-caption">{FIRM.TAGLINE}</p>
          </div>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <div className="landing-icon">
            <Building2 size={24} aria-hidden="true" />
          </div>
          <p className="eyebrow">{FIRM.TAGLINE}</p>
          <h1 id="landing-title">{FIRM.NAME}</h1>
          <p className="landing-summary">
            A focused work desk for assigning client compliance work, collecting staff updates,
            and reviewing daily progress across the firm.
          </p>

          <div className="landing-use-cases" aria-label="Chartered accountancy workflows">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;

              return (
                <span className="use-case-chip" key={useCase.label}>
                  <Icon size={16} aria-hidden="true" />
                  {useCase.label}
                </span>
              );
            })}
          </div>
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
