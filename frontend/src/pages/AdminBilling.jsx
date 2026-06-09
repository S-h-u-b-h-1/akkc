import { useEffect, useState } from 'react';
import { FileText, Building2, PenTool, Layers } from 'lucide-react';
import { getEntities } from '../services/billingService.js';
import { EligibleTasksTab } from '../features/billing/EligibleTasksTab.jsx';
import { GeneratedBillsTab } from '../features/billing/GeneratedBillsTab.jsx';
import { ManualBillTab } from '../features/billing/ManualBillTab.jsx';
import { BillingEntitiesTab } from '../features/billing/BillingEntitiesTab.jsx';

export function AdminBilling() {
  const [activeTab, setActiveTab] = useState('eligible');
  const [entities, setEntities] = useState([]);

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const res = await getEntities();
      setEntities(res.data?.entities || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="page-stack admin-billing">
      <div className="page-header">
        <div>
          <p className="eyebrow">Advanced Billing Management</p>
          <h1>Billing & Invoices</h1>
        </div>
      </div>

      <div className="tabs scrollable-tabs">
        <button className={activeTab === 'eligible' ? 'active' : ''} onClick={() => setActiveTab('eligible')}>
          <FileText size={16} /> Eligible Tasks
        </button>
        <button className={activeTab === 'manual' ? 'active' : ''} onClick={() => setActiveTab('manual')}>
          <PenTool size={16} /> Manual Bill
        </button>
        <button className={activeTab === 'bills' ? 'active' : ''} onClick={() => setActiveTab('bills')}>
          <Layers size={16} /> Generated Bills
        </button>
        <button className={activeTab === 'entities' ? 'active' : ''} onClick={() => setActiveTab('entities')}>
          <Building2 size={16} /> Billing Entities
        </button>
      </div>

      <div className="tab-content-container">
        {activeTab === 'eligible' && <EligibleTasksTab entities={entities} />}
        {activeTab === 'manual' && <ManualBillTab entities={entities} />}
        {activeTab === 'bills' && <GeneratedBillsTab entities={entities} />}
        {activeTab === 'entities' && <BillingEntitiesTab entities={entities} reloadEntities={loadEntities} />}
      </div>
    </section>
  );
}
