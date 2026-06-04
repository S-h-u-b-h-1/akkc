import assert from 'node:assert/strict';
import test from 'node:test';

import request from 'supertest';

import app from '../src/app.js';

test('GET /api/v1/health returns a healthy response', async () => {
  const response = await request(app).get('/api/v1/health').expect(200);

  assert.equal(response.body.success, true);
  assert.equal(response.body.message, 'Service is healthy.');
  assert.equal(response.body.data.service, 'employee-task-management-api');
});
