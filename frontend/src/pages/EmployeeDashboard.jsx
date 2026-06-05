import { useEffect, useMemo, useState } from 'react';

import { TASK_STATUSES } from '../constants/task.js';
import { TaskStatsCards } from '../features/dashboard-analytics/TaskStatsCards.jsx';
import { EmployeeTaskActionModal } from '../features/employee-task-management/EmployeeTaskActionModal.jsx';
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
      pendingTasks: 0,
      completedTasks: 0,
      notDoneTasks: 0,
      delayedTasks: 0
    }
  );

export function EmployeeDashboard() {
  const [activeAction, setActiveAction] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const stats = useMemo(() => createTaskStats(tasks), [tasks]);

  useEffect(() => {
    let isCurrent = true;

    getEmployeeTasks()
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
  }, []);

  const refreshTasks = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await getEmployeeTasks();
      setTasks(response.data?.tasks ?? []);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openActionModal = (task, action) => {
    setActiveTask(task);
    setActiveAction(action);
  };

  const closeActionModal = () => {
    setActiveTask(null);
    setActiveAction(null);
  };

  const submitTaskAction = async (value) => {
    if (activeAction === taskActionTypes.DONE) {
      await markEmployeeTaskDone(activeTask.id, { remark: value });
    }

    if (activeAction === taskActionTypes.NOT_DONE) {
      await markEmployeeTaskNotDone(activeTask.id, { reason: value });
    }

    await refreshTasks();
  };

  return (
    <section className="page-stack employee-dashboard">
      <div className="page-header">
        <div>
          <p className="eyebrow">Employee workspace</p>
          <h1>My assigned tasks</h1>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <TaskStatsCards isLoading={isLoading} stats={stats} />

      <EmployeeTaskTable
        isLoading={isLoading}
        onMarkDone={(task) => openActionModal(task, taskActionTypes.DONE)}
        onMarkNotDone={(task) => openActionModal(task, taskActionTypes.NOT_DONE)}
        tasks={tasks}
      />

      <EmployeeTaskActionModal
        action={activeAction}
        onClose={closeActionModal}
        onSubmit={submitTaskAction}
        task={activeTask}
      />
    </section>
  );
}
