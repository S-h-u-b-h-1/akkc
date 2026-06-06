import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ROUTES } from '../constants/routes.js';

import { PracticeInsights } from '../features/dashboard-analytics/PracticeInsights.jsx';
import { TaskStatsCards } from '../features/dashboard-analytics/TaskStatsCards.jsx';
import { EmployeeManagement } from '../features/employee-management/EmployeeManagement.jsx';
import { CreateTaskModal } from '../features/task-management/CreateTaskModal.jsx';
import { EditTaskModal } from '../features/task-management/EditTaskModal.jsx';
import { TaskFilters } from '../features/task-management/TaskFilters.jsx';
import { TaskTable } from '../features/task-management/TaskTable.jsx';
import {
  createAdminEmployee,
  createAdminTask,
  deleteAdminEmployee,
  deleteAdminTask,
  getAdminEmployees,
  getAdminStats,
  getAdminTasks,
  updateAdminEmployee,
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
  date: '',
  isHighPriority: ''
};

export function AdminDashboard() {
  const location = useLocation();
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

    try {
      await deleteAdminTask(task.id);
      await refreshDashboard();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const handleCreateEmployee = async (payload) => {
    await createAdminEmployee(payload);
    await refreshDashboard();
  };

  const handleUpdateEmployee = async (employeeId, payload) => {
    await updateAdminEmployee(employeeId, payload);
    await refreshDashboard();
  };

  const handleDeleteEmployee = async (employee) => {
    const shouldDelete = window.confirm(`Delete login credentials for ${employee.name}?`);

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteAdminEmployee(employee.id);
      await refreshDashboard();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const isDashboardRoute =
    location.pathname === ROUTES.ADMIN_DASHBOARD || location.pathname === ROUTES.ADMIN_ROOT;
  const isEmployeesRoute = location.pathname === ROUTES.ADMIN_EMPLOYEES;
  const isTasksRoute = location.pathname === ROUTES.ADMIN_TASKS;

  const getHeaderDetails = () => {
    if (isEmployeesRoute) {
      return { eyebrow: 'Firm team', title: 'Staff credential management' };
    }
    if (isTasksRoute) {
      return { eyebrow: 'Client work', title: 'Assignments' };
    }
    return { eyebrow: 'A K Kataruka and Company', title: 'Team AKKC' };
  };

  const header = getHeaderDetails();

  return (
    <section className="page-stack admin-dashboard">
      <div className="page-header">
        <div>
          <p className="eyebrow">{header.eyebrow}</p>
          <h1>{header.title}</h1>
        </div>
        {isTasksRoute ? (
          <button className="primary-button fit-button" type="button" onClick={() => setIsCreateTaskOpen(true)}>
            <Plus size={18} aria-hidden="true" />
            <span>Create assignment</span>
          </button>
        ) : null}
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      {isDashboardRoute ? (
        <>
          <TaskStatsCards isLoading={isLoading} stats={stats} />
          <PracticeInsights isLoading={isLoading} scope="admin" stats={stats} tasks={tasks} />
        </>
      ) : null}

      {isTasksRoute ? (
        <>
          <TaskFilters
            employees={employees}
            filters={filters}
            onChange={handleFilterChange}
            onReset={() => handleFilterChange(initialFilters)}
          />
          <TaskTable
            isLoading={isLoading}
            onDelete={handleDeleteTask}
            onEdit={setTaskBeingEdited}
            tasks={tasks}
          />
        </>
      ) : null}

      {isEmployeesRoute ? (
        <EmployeeManagement
          employees={employees}
          onCreateEmployee={handleCreateEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onUpdateEmployee={handleUpdateEmployee}
        />
      ) : null}

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
