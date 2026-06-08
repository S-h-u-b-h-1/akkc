import { Filter, RotateCcw } from 'lucide-react';

import { TASK_PRIORITY_FILTER_OPTIONS, TASK_STATUS_OPTIONS } from '../../constants/task.js';

export function EmployeeTaskFilters({ filters, onChange, onReset }) {
  const updateFilter = (event) => {
    onChange({
      ...filters,
      [event.target.name]: event.target.value
    });
  };

  return (
    <section className="toolbar-panel" aria-label="Task filters">
      <div className="toolbar-title">
        <Filter size={18} aria-hidden="true" />
        <span>Filters</span>
      </div>

      <div className="filter-grid">
        <label>
          <span>Status</span>
          <select name="status" value={filters.status} onChange={updateFilter}>
            <option value="">All statuses</option>
            {TASK_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Client / entity</span>
          <input
            name="clientName"
            placeholder="Search client or entity"
            type="search"
            value={filters.clientName}
            onChange={updateFilter}
          />
        </label>

        <label>
          <span>Due date</span>
          <input name="date" type="date" value={filters.date} onChange={updateFilter} />
        </label>

        <label>
          <span>Priority</span>
          <select name="isHighPriority" value={filters.isHighPriority} onChange={updateFilter}>
            {TASK_PRIORITY_FILTER_OPTIONS.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="secondary-button icon-button-text" type="button" onClick={onReset}>
        <RotateCcw size={16} aria-hidden="true" />
        <span>Reset</span>
      </button>
    </section>
  );
}
