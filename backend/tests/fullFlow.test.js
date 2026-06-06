import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-route-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1d';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test';

const { default: app } = await import('../src/app.js');
const { TASK_STATUSES } = await import('../src/constants/task.js');
const { setPrismaClientForTesting } = await import('../src/prisma/client.js');

const isoDate = (date) => date.toISOString().slice(0, 10);

const addDays = (days) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
};

const cloneRecord = (record) => ({ ...record });

const selectedRecord = (record, select) => {
  if (!record) {
    return null;
  }

  if (!select) {
    return cloneRecord(record);
  }

  return Object.entries(select).reduce((selected, [key, shouldSelect]) => {
    if (shouldSelect === true) {
      selected[key] = record[key];
    }

    return selected;
  }, {});
};

const sameDate = (left, right) => isoDate(new Date(left)) === isoDate(new Date(right));

const compareDate = (left, operator, right) => {
  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();

  if (operator === 'lt') {
    return leftTime < rightTime;
  }

  if (operator === 'gte') {
    return leftTime >= rightTime;
  }

  return false;
};

const createMockPrismaClient = () => {
  const store = {
    admins: [],
    employees: [],
    tasks: [],
    taskUpdates: []
  };

  const now = () => new Date();

  const publicEmployee = (employee) =>
    selectedRecord(employee, {
      id: true,
      name: true,
      username: true,
      email: true,
      department: true,
      createdByAdminId: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    });

  const publicTaskUpdate = (update) => {
    const employee = store.employees.find((candidate) => candidate.id === update.employeeId);

    return {
      id: update.id,
      status: update.status,
      remark: update.remark,
      reason: update.reason,
      createdAt: update.createdAt,
      employeeId: update.employeeId,
      employee: employee
        ? {
            id: employee.id,
            name: employee.name,
            username: employee.username,
            email: employee.email
          }
        : null
    };
  };

  const publicTask = (task) => {
    if (!task) {
      return null;
    }

    const employee = store.employees.find((candidate) => candidate.id === task.assignedEmployeeId);

    return {
      ...cloneRecord(task),
      assignedEmployee: employee
        ? {
            id: employee.id,
            name: employee.name,
            username: employee.username,
            email: employee.email,
            department: employee.department
          }
        : null,
      updates: store.taskUpdates
        .filter((update) => update.taskId === task.id)
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
        .map(publicTaskUpdate)
    };
  };

  const matchesEmployeeWhere = (employee, where) =>
    Object.entries(where).every(([key, value]) => {
      if (value === null) {
        return employee[key] === null;
      }

      return employee[key] === value;
    });

  const matchesDueDate = (task, condition) => {
    if (condition instanceof Date) {
      return sameDate(task.dueDate, condition);
    }

    if (condition?.lt) {
      return compareDate(task.dueDate, 'lt', condition.lt);
    }

    if (condition?.gte) {
      return compareDate(task.dueDate, 'gte', condition.gte);
    }

    return sameDate(task.dueDate, condition);
  };

  const matchesTaskWhere = (task, where) => {
    const baseMatches = Object.entries(where).every(([key, value]) => {
      if (key === 'OR') {
        return true;
      }

      if (key === 'clientName') {
        return task.clientName.toLowerCase().includes(value.contains.toLowerCase());
      }

      if (key === 'dueDate') {
        return matchesDueDate(task, value);
      }

      return task[key] === value;
    });

    if (!baseMatches) {
      return false;
    }

    if (where.OR) {
      return where.OR.some((branch) => matchesTaskWhere(task, branch));
    }

    return true;
  };

  const sortTasks = (tasks) =>
    [...tasks].sort((left, right) => {
      const dueDateDifference = new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();

      if (dueDateDifference !== 0) {
        return dueDateDifference;
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

  const client = {
    admin: {
      findUnique: async ({ where, select }) => {
        const admin = store.admins.find((candidate) =>
          where.email ? candidate.email === where.email : candidate.id === where.id
        );

        return selectedRecord(admin, select);
      },
      create: async ({ data, select }) => {
        const admin = {
          id: randomUUID(),
          ...data,
          createdAt: now(),
          updatedAt: now()
        };

        store.admins.push(admin);

        return selectedRecord(admin, select);
      }
    },
    employee: {
      findUnique: async ({ where, select }) => {
        const employee = store.employees.find((candidate) =>
          where.email
            ? candidate.email === where.email
            : where.username
              ? candidate.username === where.username
              : candidate.id === where.id
        );

        return selectedRecord(employee, select);
      },
      findFirst: async ({ where }) => {
        const employee = store.employees.find((candidate) => matchesEmployeeWhere(candidate, where));

        return publicEmployee(employee);
      },
      findMany: async ({ where }) =>
        store.employees
          .filter((employee) => matchesEmployeeWhere(employee, where))
          .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
          .map(publicEmployee),
      create: async ({ data }) => {
        const employee = {
          id: randomUUID(),
          ...data,
          deletedAt: null,
          createdAt: now(),
          updatedAt: now()
        };

        store.employees.push(employee);

        return publicEmployee(employee);
      },
      update: async ({ where, data }) => {
        const employee = store.employees.find((candidate) => candidate.id === where.id);
        Object.assign(employee, data, { updatedAt: now() });

        return publicEmployee(employee);
      }
    },
    task: {
      create: async ({ data }) => {
        const task = {
          id: randomUUID(),
          ...data,
          createdAt: now(),
          updatedAt: now()
        };

        store.tasks.push(task);

        return publicTask(task);
      },
      findMany: async ({ where }) => sortTasks(store.tasks.filter((task) => matchesTaskWhere(task, where))).map(publicTask),
      findFirst: async ({ where }) => publicTask(store.tasks.find((task) => matchesTaskWhere(task, where))),
      update: async ({ where, data }) => {
        const task = store.tasks.find((candidate) => candidate.id === where.id);
        Object.assign(task, data, { updatedAt: now() });

        return publicTask(task);
      },
      delete: async ({ where }) => {
        const taskIndex = store.tasks.findIndex((candidate) => candidate.id === where.id);
        const [task] = store.tasks.splice(taskIndex, 1);

        return publicTask(task);
      }
    },
    taskUpdate: {
      create: async ({ data }) => {
        const update = {
          id: randomUUID(),
          ...data,
          createdAt: now()
        };

        store.taskUpdates.push(update);

        return publicTaskUpdate(update);
      }
    },
    $transaction: async (callback) => callback(client),
    $disconnect: async () => {}
  };

  return client;
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

test('complete admin and employee task management flow', async () => {
  setPrismaClientForTesting(createMockPrismaClient());

  const adminSignup = await request(app)
    .post('/api/admin/signup')
    .send({
      name: 'Operations Admin',
      email: 'admin.flow@example.com',
      password: 'StrongPass123'
    })
    .expect(201);

  assert.equal(adminSignup.body.success, true);
  assert.equal(adminSignup.body.data.user.role, 'ADMIN');
  assert.equal(adminSignup.body.data.user.passwordHash, undefined);

  const adminLogin = await request(app)
    .post('/api/admin/login')
    .send({
      email: 'admin.flow@example.com',
      password: 'StrongPass123'
    })
    .expect(200);
  const adminToken = adminLogin.body.data.token;

  const adminMe = await request(app).get('/api/auth/me').set(authHeader(adminToken)).expect(200);
  assert.equal(adminMe.body.data.user.email, 'admin.flow@example.com');
  assert.equal(adminMe.body.data.user.role, 'ADMIN');

  const employeeCreate = await request(app)
    .post('/api/admin/employees')
    .set(authHeader(adminToken))
    .send({
      name: 'Jane Employee',
      email: 'jane.flow@example.com',
      username: 'jane.audit',
      password: 'EmployeePass123',
      department: 'Design'
    })
    .expect(201);
  const employee = employeeCreate.body.data.employee;
  assert.equal(employee.passwordHash, undefined);
  assert.equal(employee.username, 'jane.audit');
  assert.equal(employee.department, 'Design');

  const secondEmployeeCreate = await request(app)
    .post('/api/admin/employees')
    .set(authHeader(adminToken))
    .send({
      name: 'Alex Employee',
      email: 'alex.flow@example.com',
      username: 'alex.tax',
      password: 'EmployeePass123',
      department: 'Development'
    })
    .expect(201);
  const secondEmployee = secondEmployeeCreate.body.data.employee;

  await request(app)
    .post('/api/admin/employees')
    .set(authHeader(adminToken))
    .send({
      name: 'Duplicate Employee',
      username: 'jane.audit',
      password: 'EmployeePass123'
    })
    .expect(409);

  const employeesList = await request(app).get('/api/admin/employees').set(authHeader(adminToken)).expect(200);
  assert.equal(employeesList.body.data.employees.length, 2);

  const employeeUpdate = await request(app)
    .put(`/api/admin/employees/${secondEmployee.id}`)
    .set(authHeader(adminToken))
    .send({ department: 'QA' })
    .expect(200);
  assert.equal(employeeUpdate.body.data.employee.department, 'QA');

  const futureDate = addDays(3);
  const delayedDate = addDays(-2);

  const pendingTaskCreate = await request(app)
    .post('/api/admin/tasks')
    .set(authHeader(adminToken))
    .send({
      employeeId: employee.id,
      title: 'Prepare homepage QA notes',
      domain: 'Design',
      clientName: 'Acme',
      dueDate: futureDate
    })
    .expect(201);
  const pendingTask = pendingTaskCreate.body.data.task;
  assert.equal(pendingTask.status, TASK_STATUSES.PENDING);

  const delayedTaskCreate = await request(app)
    .post('/api/admin/tasks')
    .set(authHeader(adminToken))
    .send({
      employeeId: employee.id,
      title: 'Send overdue report',
      domain: 'Operations',
      clientName: 'Beta',
      dueDate: delayedDate
    })
    .expect(201);
  const delayedTask = delayedTaskCreate.body.data.task;
  assert.equal(delayedTask.status, TASK_STATUSES.DELAYED);

  const secondEmployeeTaskCreate = await request(app)
    .post('/api/admin/tasks')
    .set(authHeader(adminToken))
    .send({
      employeeId: secondEmployee.id,
      title: 'Build Acme export',
      domain: 'Development',
      clientName: 'Acme',
      dueDate: futureDate
    })
    .expect(201);
  const secondEmployeeTask = secondEmployeeTaskCreate.body.data.task;

  const taskDetail = await request(app)
    .get(`/api/admin/tasks/${pendingTask.id}`)
    .set(authHeader(adminToken))
    .expect(200);
  assert.equal(taskDetail.body.data.task.title, 'Prepare homepage QA notes');

  const allTasks = await request(app).get('/api/admin/tasks').set(authHeader(adminToken)).expect(200);
  assert.equal(allTasks.body.data.tasks.length, 3);

  const pendingTasks = await request(app)
    .get('/api/admin/tasks')
    .query({ status: TASK_STATUSES.PENDING })
    .set(authHeader(adminToken))
    .expect(200);
  assert.equal(pendingTasks.body.data.tasks.length, 2);
  assert.equal(pendingTasks.body.data.tasks.some((task) => task.id === delayedTask.id), false);

  const delayedTasks = await request(app)
    .get('/api/admin/tasks')
    .query({ status: TASK_STATUSES.DELAYED })
    .set(authHeader(adminToken))
    .expect(200);
  assert.equal(delayedTasks.body.data.tasks.length, 1);
  assert.equal(delayedTasks.body.data.tasks[0].id, delayedTask.id);

  const clientFilteredTasks = await request(app)
    .get('/api/admin/tasks')
    .query({ clientName: 'acm' })
    .set(authHeader(adminToken))
    .expect(200);
  assert.equal(clientFilteredTasks.body.data.tasks.length, 2);

  const employeeFilteredTasks = await request(app)
    .get('/api/admin/tasks')
    .query({ employeeId: employee.id })
    .set(authHeader(adminToken))
    .expect(200);
  assert.equal(employeeFilteredTasks.body.data.tasks.length, 2);

  const dateFilteredTasks = await request(app)
    .get('/api/admin/tasks')
    .query({ date: futureDate })
    .set(authHeader(adminToken))
    .expect(200);
  assert.equal(dateFilteredTasks.body.data.tasks.length, 2);

  const initialStats = await request(app).get('/api/admin/stats').set(authHeader(adminToken)).expect(200);
  assert.equal(initialStats.body.data.stats.totalTasks, 3);
  assert.equal(initialStats.body.data.stats.pendingTasks, 2);
  assert.equal(initialStats.body.data.stats.delayedTasks, 1);
  assert.equal(initialStats.body.data.stats.tasksByClient.length, 2);
  assert.equal(initialStats.body.data.stats.tasksByEmployee.length, 2);

  const employeeLogin = await request(app)
    .post('/api/employee/login')
    .send({
      username: 'jane.audit',
      password: 'EmployeePass123'
    })
    .expect(200);
  const employeeToken = employeeLogin.body.data.token;

  const employeeMe = await request(app).get('/api/auth/me').set(authHeader(employeeToken)).expect(200);
  assert.equal(employeeMe.body.data.user.role, 'EMPLOYEE');
  assert.equal(employeeMe.body.data.user.username, 'jane.audit');

  await request(app).get('/api/admin/employees').set(authHeader(employeeToken)).expect(403);
  await request(app).get('/api/employee/tasks').set(authHeader(adminToken)).expect(403);

  const employeeTasks = await request(app).get('/api/employee/tasks').set(authHeader(employeeToken)).expect(200);
  assert.equal(employeeTasks.body.data.tasks.length, 2);
  assert.equal(employeeTasks.body.data.tasks.some((task) => task.id === secondEmployeeTask.id), false);

  await request(app)
    .put(`/api/employee/tasks/${pendingTask.id}/done`)
    .set(authHeader(employeeToken))
    .send({})
    .expect(400);

  const doneUpdate = await request(app)
    .put(`/api/employee/tasks/${pendingTask.id}/done`)
    .set(authHeader(employeeToken))
    .send({ remark: 'Completed and reviewed with the client.' })
    .expect(200);
  assert.equal(doneUpdate.body.data.task.status, TASK_STATUSES.COMPLETED);
  assert.equal(doneUpdate.body.data.task.updates[0].remark, 'Completed and reviewed with the client.');

  await request(app)
    .put(`/api/employee/tasks/${delayedTask.id}/not-done`)
    .set(authHeader(employeeToken))
    .send({})
    .expect(400);

  const notDoneUpdate = await request(app)
    .put(`/api/employee/tasks/${delayedTask.id}/not-done`)
    .set(authHeader(employeeToken))
    .send({ reason: 'Client assets were not available.' })
    .expect(200);
  assert.equal(notDoneUpdate.body.data.task.status, TASK_STATUSES.NOT_DONE);
  assert.equal(notDoneUpdate.body.data.task.updates[0].reason, 'Client assets were not available.');

  const updatedStats = await request(app).get('/api/admin/stats').set(authHeader(adminToken)).expect(200);
  assert.equal(updatedStats.body.data.stats.totalTasks, 3);
  assert.equal(updatedStats.body.data.stats.pendingTasks, 1);
  assert.equal(updatedStats.body.data.stats.completedTasks, 1);
  assert.equal(updatedStats.body.data.stats.notDoneTasks, 1);
  assert.equal(updatedStats.body.data.stats.delayedTasks, 0);

  const updatedTaskDetail = await request(app)
    .get(`/api/admin/tasks/${pendingTask.id}`)
    .set(authHeader(adminToken))
    .expect(200);
  assert.equal(updatedTaskDetail.body.data.task.updates[0].remark, 'Completed and reviewed with the client.');

  const editedTask = await request(app)
    .put(`/api/admin/tasks/${secondEmployeeTask.id}`)
    .set(authHeader(adminToken))
    .send({
      title: 'Build Acme export v2',
      domain: 'Engineering',
      clientName: 'Acme Global',
      dueDate: addDays(5),
      status: TASK_STATUSES.PENDING
    })
    .expect(200);
  assert.equal(editedTask.body.data.task.title, 'Build Acme export v2');
  assert.equal(editedTask.body.data.task.clientName, 'Acme Global');

  await request(app).delete(`/api/admin/employees/${secondEmployee.id}`).set(authHeader(adminToken)).expect(200);
  const employeesAfterDelete = await request(app).get('/api/admin/employees').set(authHeader(adminToken)).expect(200);
  assert.equal(employeesAfterDelete.body.data.employees.length, 1);

  await request(app).delete(`/api/admin/tasks/${secondEmployeeTask.id}`).set(authHeader(adminToken)).expect(200);
  const tasksAfterDelete = await request(app).get('/api/admin/tasks').set(authHeader(adminToken)).expect(200);
  assert.equal(tasksAfterDelete.body.data.tasks.length, 2);
});
