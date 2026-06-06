import { FIRM } from '../constants/firm.js';

export function BrandLogo({ className = 'brand-logo', showText = true }) {
  return (
    <div className={className}>
      <span className="brand-logo-mark">
        <img src={FIRM.LOGO_URL} alt="CA logo" loading="eager" referrerPolicy="no-referrer" />
      </span>
      {showText ? (
        <div>
          <p className="brand-name">{FIRM.APP_NAME}</p>
          <p className="brand-caption">{FIRM.NAME}</p>
        </div>
      ) : null}
    </div>
  );
}
