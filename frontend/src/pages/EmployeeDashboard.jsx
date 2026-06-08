import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

import { ROUTES } from '../constants/routes.js';

import { TASK_STATUSES } from '../constants/task.js';
import { PracticeInsights } from '../features/dashboard-analytics/PracticeInsights.jsx';
import { TaskStatsCards } from '../features/dashboard-analytics/TaskStatsCards.jsx';
import { EmployeeTaskActionModal } from '../features/employee-task-management/EmployeeTaskActionModal.jsx';
import { EmployeeTaskFilters } from '../features/task-management/EmployeeTaskFilters.jsx';
import { EmployeeTaskTable } from '../features/employee-task-management/EmployeeTaskTable.jsx';
import {
  getEmployeeTasks,
  markEmployeeTaskDone,
  markEmployeeTaskNotDone
} from '../services/employeeTaskService.js';

const taskActionTypes = Object.freeze({
  DONE: 'done',
  NOT_DONE: 'notDone'
});

const createTaskStats = (tasks) =>
  tasks.reduce(
    (stats, task) => {
      stats.totalTasks += 1;

      if (task.isHighPriority) {
        stats.highPriorityTasks += 1;
      }

      if (task.status === TASK_STATUSES.PENDING) {
        stats.pendingTasks += 1;
      }

      if (task.status === TASK_STATUSES.COMPLETED) {
        stats.completedTasks += 1;
      }

      if (task.status === TASK_STATUSES.NOT_DONE) {
        stats.notDoneTasks += 1;
      }

      if (task.status === TASK_STATUSES.DELAYED) {
        stats.delayedTasks += 1;
      }

      return stats;
    },
    {
      totalTasks: 0,
      highPriorityTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      notDoneTasks: 0,
      delayedTasks: 0
    }
  );

const initialFilters = {
  status: '',
  clientName: '',
  date: '',
  isHighPriority: ''
};

export function EmployeeDashboard() {
  const location = useLocation();
  const [activeAction, setActiveAction] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const stats = useMemo(() => createTaskStats(tasks), [tasks]);

  useEffect(() => {
    let isCurrent = true;

    getEmployeeTasks(filters)
      .then((response) => {
        if (!isCurrent) {
          return;
        }

        setTasks(response.data?.tasks ?? []);
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

  const refreshTasks = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await getEmployeeTasks(filters);
      setTasks(response.data?.tasks ?? []);
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

  const openActionModal = (task, action) => {
    setActiveTask(task);
    setActiveAction(action);
  };

  const closeActionModal = () => {
    setActiveTask(null);
    setActiveAction(null);
  };

  const submitTaskAction = async (valueOrPayload) => {
    if (activeAction === taskActionTypes.DONE) {
      const payload = typeof valueOrPayload === 'object' 
        ? valueOrPayload 
        : { remark: valueOrPayload };
      await markEmployeeTaskDone(activeTask.id, payload);
    }

    if (activeAction === taskActionTypes.NOT_DONE) {
      await markEmployeeTaskNotDone(activeTask.id, { reason: valueOrPayload });
    }

    await refreshTasks();
  };

  const isDashboardRoute =
    location.pathname === ROUTES.EMPLOYEE_DASHBOARD || location.pathname === ROUTES.EMPLOYEE_ROOT;
  const isTasksRoute = location.pathname === ROUTES.EMPLOYEE_TASKS;

  const headerTitle = isTasksRoute ? 'My client assignments' : 'Team AKKC';

  return (
    <section className="page-stack employee-dashboard">
      <div className="page-header">
        <div>
          <p className="eyebrow">A K Kataruka and Company</p>
          <h1>{headerTitle}</h1>
        </div>
      </div>

      {error && (
        <div className="error-toast">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button className="icon-button" onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {isDashboardRoute || isTasksRoute ? (
        <EmployeeTaskFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={() => handleFilterChange(initialFilters)}
        />
      ) : null}

      {isDashboardRoute ? (
        <>
          <TaskStatsCards isLoading={isLoading} stats={stats} />
          <PracticeInsights isLoading={isLoading} scope="employee" stats={stats} tasks={tasks} />
        </>
      ) : null}

      {isTasksRoute ? (
        <EmployeeTaskTable
          isLoading={isLoading}
          onMarkDone={(task) => openActionModal(task, taskActionTypes.DONE)}
          onMarkNotDone={(task) => openActionModal(task, taskActionTypes.NOT_DONE)}
          tasks={tasks}
        />
      ) : null}

      <EmployeeTaskActionModal
        action={activeAction}
        onClose={closeActionModal}
        onSubmit={submitTaskAction}
        task={activeTask}
      />
    </section>
  );
}
