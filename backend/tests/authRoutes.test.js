import assert from 'node:assert/strict';
import test from 'node:test';

import request from 'supertest';

import app from '../src/app.js';

test('POST /api/employee/signup is not available', async () => {
  const response = await request(app).post('/api/employee/signup').send({}).expect(404);

  assert.equal(response.body.success, false);
});

test('GET /api/auth/me requires a bearer token', async () => {
  const response = await request(app).get('/api/auth/me').expect(401);

  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Authentication is required.');
});

test('GET /api/admin/employees requires admin authentication', async () => {
  const response = await request(app).get('/api/admin/employees').expect(401);

  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Authentication is required.');
});

test('GET /api/admin/tasks requires admin authentication', async () => {
  const response = await request(app).get('/api/admin/tasks').expect(401);

  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Authentication is required.');
});

test('GET /api/admin/stats requires admin authentication', async () => {
  const response = await request(app).get('/api/admin/stats').expect(401);

  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Authentication is required.');
});

test('GET /api/employee/tasks requires employee authentication', async () => {
  const response = await request(app).get('/api/employee/tasks').expect(401);

  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Authentication is required.');
});

test('PUT /api/employee/tasks/:id/done requires employee authentication', async () => {
  const response = await request(app)
    .put('/api/employee/tasks/2f5a6b4a-8dc5-4e9e-bd6f-b2f2a1a57a11/done')
    .send({ remark: 'Done' })
    .expect(401);

  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Authentication is required.');
});

test('POST /api/admin/signup validates request body', async () => {
  const response = await request(app)
    .post('/api/admin/signup')
    .send({
      name: 'A',
      email: 'not-an-email',
      password: 'short'
    })
    .expect(400);

  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Validation failed.');
  assert.equal(Array.isArray(response.body.errors), true);
});
