export const FIRM = Object.freeze({
  NAME: 'A K Kataruka and Company',
  SHORT_NAME: 'AKKC',
  APP_NAME: 'Team AKKC',
  LOGO_URL: 'https://mastermindsindia.com/wp-content/uploads/2024/02/Untitled-design-69-1.png',
  TAGLINE: 'Chartered Accountants'
});

export const CA_SERVICE_LINES = Object.freeze([
  'Audit & Assurance',
  'GST Compliance',
  'Income Tax',
  'TDS Compliance',
  'Company Law',
  'Accounting Review'
]);

export const CA_ASSIGNMENT_TEMPLATES = Object.freeze([
  {
    label: 'GSTR-3B monthly filing',
    title: 'Prepare and review GSTR-3B filing',
    domain: 'GST Compliance'
  },
  {
    label: 'GSTR-1 outward supplies',
    title: 'Reconcile outward supplies for GSTR-1',
    domain: 'GST Compliance'
  },
  {
    label: 'Quarterly TDS return',
    title: 'Prepare quarterly TDS return working',
    domain: 'TDS Compliance'
  },
  {
    label: 'Tax audit Form 3CD',
    title: 'Review Form 3CD clauses and audit notes',
    domain: 'Audit & Assurance'
  },
  {
    label: 'Income-tax return review',
    title: 'Review documents for income-tax return filing',
    domain: 'Income Tax'
  },
  {
    label: 'ROC annual filing checklist',
    title: 'Prepare ROC annual filing checklist',
    domain: 'Company Law'
  },
  {
    label: 'Monthly books review',
    title: 'Verify monthly books and bank reconciliation',
    domain: 'Accounting Review'
  }
]);
