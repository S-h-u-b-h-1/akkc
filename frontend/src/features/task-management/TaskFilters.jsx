import { Filter, RotateCcw } from 'lucide-react';

import { TASK_STATUS_OPTIONS } from '../../constants/task.js';

export function TaskFilters({ employees, filters, onChange, onReset }) {
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
          <span>Client name</span>
          <input
            name="clientName"
            placeholder="Search client"
            type="search"
            value={filters.clientName}
            onChange={updateFilter}
          />
        </label>

        <label>
          <span>Employee</span>
          <select name="employeeId" value={filters.employeeId} onChange={updateFilter}>
            <option value="">All employees</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Due date</span>
          <input name="date" type="date" value={filters.date} onChange={updateFilter} />
        </label>
      </div>

      <button className="secondary-button icon-button-text" type="button" onClick={onReset}>
        <RotateCcw size={16} aria-hidden="true" />
        <span>Reset</span>
      </button>
    </section>
  );
}
