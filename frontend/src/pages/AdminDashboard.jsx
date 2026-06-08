import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ROUTES } from '../constants/routes.js';

import { AdminManagement } from '../features/admin-management/AdminManagement.jsx';
import { PracticeInsights } from '../features/dashboard-analytics/PracticeInsights.jsx';
import { TaskStatsCards } from '../features/dashboard-analytics/TaskStatsCards.jsx';
import { EmployeeManagement } from '../features/employee-management/EmployeeManagement.jsx';
import { CreateTaskModal } from '../features/task-management/CreateTaskModal.jsx';
import { EditTaskModal } from '../features/task-management/EditTaskModal.jsx';
import { TaskFilters } from '../features/task-management/TaskFilters.jsx';
import { TaskTable } from '../features/task-management/TaskTable.jsx';
import {
  createAdminAccount,
  createAdminEmployee,
  createAdminTask,
  deleteAdminAccount,
  deleteAdminEmployee,
  deleteAdminTask,
  getAdminAccounts,
  getAdminEmployees,
  getAdminStats,
  getAdminTasks,
  updateAdminAccount,
  updateAdminEmployee,
  updateAdminTask
} from '../services/adminService.js';
import { useAuth } from '../hooks/useAuth.js';

const getRouteRequirements = (pathname) => {
  const isDashboardRoute =
    pathname === ROUTES.ADMIN_DASHBOARD || pathname === ROUTES.ADMIN_ROOT;
  const isAdminsRoute = pathname === ROUTES.ADMIN_ADMINS;
  const isEmployeesRoute = pathname === ROUTES.ADMIN_EMPLOYEES;
  const isTasksRoute = pathname === ROUTES.ADMIN_TASKS;

  return {
    admins: isAdminsRoute,
    employees: isEmployeesRoute || isTasksRoute,
    stats: isDashboardRoute,
    tasks: isDashboardRoute || isTasksRoute
  };
};

const fetchDashboardSnapshot = async ({ filters, requirements }) => {
  const snapshot = {};
  const errors = [];
  const requests = [];

  if (requirements.stats) {
    requests.push(
      getAdminStats()
        .then((response) => {
          snapshot.stats = response.data?.stats ?? null;
        })
        .catch((error) => {
          errors.push(error.message);
        })
    );
  }

  if (requirements.tasks) {
    requests.push(
      getAdminTasks(filters)
        .then((response) => {
          snapshot.tasks = response.data?.tasks ?? [];
        })
        .catch((error) => {
          errors.push(error.message);
        })
    );
  }

  if (requirements.employees) {
    requests.push(
      getAdminEmployees()
        .then((response) => {
          snapshot.employees = response.data?.employees ?? [];
        })
        .catch((error) => {
          errors.push(error.message);
        })
    );
  }

  if (requirements.admins) {
    requests.push(
      getAdminAccounts()
        .then((response) => {
          snapshot.admins = response.data?.admins ?? [];
        })
        .catch((error) => {
          errors.push(error.message);
        })
    );
  }

  await Promise.all(requests);

  if (errors.length > 0) {
    const error = new Error([...new Set(errors)].join(' '));
    error.snapshot = snapshot;
    throw error;
  }

  return snapshot;
};

const applySnapshot = (snapshot, setters) => {
  if (Object.hasOwn(snapshot, 'stats')) {
    setters.setStats(snapshot.stats);
  }

  if (Object.hasOwn(snapshot, 'tasks')) {
    setters.setTasks(snapshot.tasks);
  }

  if (Object.hasOwn(snapshot, 'employees')) {
    setters.setEmployees(snapshot.employees);
  }

  if (Object.hasOwn(snapshot, 'admins')) {
    setters.setAdmins(snapshot.admins);
  }
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
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
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
    const requirements = getRouteRequirements(location.pathname);

    fetchDashboardSnapshot({ filters, requirements })
      .then((snapshot) => {
        if (!isCurrent) {
          return;
        }

        applySnapshot(snapshot, { setAdmins, setEmployees, setStats, setTasks });
        setError('');
      })
      .catch((loadError) => {
        if (isCurrent) {
          if (loadError.snapshot) {
            applySnapshot(loadError.snapshot, { setAdmins, setEmployees, setStats, setTasks });
          }
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
  }, [filters, location.pathname]);

  const refreshDashboard = async () => {
    setError('');
    setIsLoading(true);

    try {
      const snapshot = await fetchDashboardSnapshot({
        filters,
        requirements: getRouteRequirements(location.pathname)
      });
      applySnapshot(snapshot, { setAdmins, setEmployees, setStats, setTasks });
      setError('');
    } catch (loadError) {
      if (loadError.snapshot) {
        applySnapshot(loadError.snapshot, { setAdmins, setEmployees, setStats, setTasks });
      }
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

  const handleCreateAdmin = async (payload) => {
    await createAdminAccount(payload);
    await refreshDashboard();
  };

  const handleUpdateAdmin = async (adminId, payload) => {
    await updateAdminAccount(adminId, payload);
    await refreshDashboard();
  };

  const handleDeleteAdmin = async (admin) => {
    const shouldDelete = window.confirm(`Delete admin login for ${admin.name}?`);

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteAdminAccount(admin.id);
      await refreshDashboard();
    } catch (deleteError) {
      setError(deleteError.message);
    }
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
  const isAdminsRoute = location.pathname === ROUTES.ADMIN_ADMINS;
  const isEmployeesRoute = location.pathname === ROUTES.ADMIN_EMPLOYEES;
  const isTasksRoute = location.pathname === ROUTES.ADMIN_TASKS;

  const getHeaderDetails = () => {
    if (isAdminsRoute) {
      return { eyebrow: 'Firm administration', title: 'Admin access' };
    }
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

      {isAdminsRoute ? (
        <AdminManagement
          admins={admins}
          currentAdminId={user?.id}
          onCreateAdmin={handleCreateAdmin}
          onDeleteAdmin={handleDeleteAdmin}
          onUpdateAdmin={handleUpdateAdmin}
        />
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
