import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

import { TaskStatsCards } from '../features/dashboard-analytics/TaskStatsCards.jsx';
import { EmployeeManagement } from '../features/employee-management/EmployeeManagement.jsx';
import { CreateTaskModal } from '../features/task-management/CreateTaskModal.jsx';
import { EditTaskModal } from '../features/task-management/EditTaskModal.jsx';
import { TaskFilters } from '../features/task-management/TaskFilters.jsx';
import { TaskTable } from '../features/task-management/TaskTable.jsx';
import {
  createAdminEmployee,
  createAdminTask,
  deleteAdminTask,
  getAdminEmployees,
  getAdminStats,
  getAdminTasks,
  updateAdminTask
} from '../services/adminService.js';

const fetchDashboardSnapshot = async (filters) => {
  const [statsResponse, tasksResponse, employeesResponse] = await Promise.all([
    getAdminStats(),
    getAdminTasks(filters),
    getAdminEmployees()
  ]);

  return {
    employees: employeesResponse.data?.employees ?? [],
    stats: statsResponse.data?.stats ?? null,
    tasks: tasksResponse.data?.tasks ?? []
  };
};

const initialFilters = {
  status: '',
  clientName: '',
  employeeId: '',
  date: ''
};

export function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    fetchDashboardSnapshot(filters)
      .then((snapshot) => {
        if (!isCurrent) {
          return;
        }

        setStats(snapshot.stats);
        setTasks(snapshot.tasks);
        setEmployees(snapshot.employees);
        setError('');
      })
      .catch((loadError) => {
        if (isCurrent) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [filters]);

  const refreshDashboard = async () => {
    setError('');
    setIsLoading(true);

    try {
      const snapshot = await fetchDashboardSnapshot(filters);
      setStats(snapshot.stats);
      setTasks(snapshot.tasks);
      setEmployees(snapshot.employees);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (nextFilters) => {
    setError('');
    setIsLoading(true);
    setFilters(nextFilters);
  };

  const handleCreateTask = async (payload) => {
    await createAdminTask(payload);
    await refreshDashboard();
  };

  const handleUpdateTask = async (taskId, payload) => {
    await updateAdminTask(taskId, payload);
    await refreshDashboard();
  };

  const handleDeleteTask = async (task) => {
    const shouldDelete = window.confirm(`Delete "${task.title}"?`);

    if (!shouldDelete) {
      return;
    }

    await deleteAdminTask(task.id);
    await refreshDashboard();
  };

  const handleCreateEmployee = async (payload) => {
    await createAdminEmployee(payload);
    await refreshDashboard();
  };

  return (
    <section className="page-stack admin-dashboard">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin operations</p>
          <h1>Admin dashboard</h1>
        </div>
        <button className="primary-button fit-button" type="button" onClick={() => setIsCreateTaskOpen(true)}>
          <Plus size={18} aria-hidden="true" />
          <span>Create task</span>
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <TaskStatsCards stats={stats} />

      <TaskFilters
        employees={employees}
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(initialFilters)}
      />

      <div className="admin-work-grid">
        <TaskTable
          isLoading={isLoading}
          onDelete={handleDeleteTask}
          onEdit={setTaskBeingEdited}
          tasks={tasks}
        />
        <EmployeeManagement employees={employees} onCreateEmployee={handleCreateEmployee} />
      </div>

      <CreateTaskModal
        employees={employees}
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleCreateTask}
      />
      {taskBeingEdited ? (
        <EditTaskModal
          employees={employees}
          onClose={() => setTaskBeingEdited(null)}
          onSubmit={handleUpdateTask}
          task={taskBeingEdited}
        />
      ) : null}
    </section>
  );
}
