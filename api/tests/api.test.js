import test from 'node:test';
import assert from 'node:assert/strict';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { app, Room, Meeting, WorkflowTemplate, seedData, connectDb, memoryServer } from '../server.js';

const request = supertest(app);

test.before(async () => {
  await connectDb();
  await seedData();
});

test.after(async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
});

test('health endpoint responds', async () => {
  const response = await request.get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('dashboard endpoint returns seeded data', async () => {
  const response = await request.get('/api/dashboard');
  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.body.rooms), true);
  assert.equal(Array.isArray(response.body.meetings), true);
  assert.equal(Array.isArray(response.body.users), true);
  assert.equal(Array.isArray(response.body.utilization), true);
  assert.equal(Array.isArray(response.body.workflowTemplates), true);
});

test('seed data includes sample meeting rooms 1-4', async () => {
  const response = await request.get('/api/dashboard');
  const roomNames = response.body.rooms.map((room) => room.name);
  for (const name of ['Meeting Room 1', 'Meeting Room 2', 'Meeting Room 3', 'Meeting Room 4']) {
    assert.ok(roomNames.includes(name), `expected ${name} in seeded rooms`);
  }
});

test('seed data adds missing sample rooms when other rooms already exist', async () => {
  await Room.deleteMany({ name: { $in: ['Meeting Room 1', 'Meeting Room 2', 'Meeting Room 3', 'Meeting Room 4'] } });
  await Room.create({ name: 'Existing Room', floor: 'Floor 1', capacity: 6, status: 'available', sensor: 'AiSense X', tablet: 'Kiosk 99' });

  await seedData();

  const roomNames = (await Room.find().lean()).map((room) => room.name);
  for (const name of ['Meeting Room 1', 'Meeting Room 2', 'Meeting Room 3', 'Meeting Room 4']) {
    assert.ok(roomNames.includes(name), `expected ${name} to be inserted during reseed`);
  }
});

test('invalid JSON payload returns a 400 response', async () => {
  const response = await request.post('/api/rooms').set('Content-Type', 'application/json').send('{not: valid json');
  assert.equal(response.status, 400);
  assert.match(response.body.error, /invalid json/i);
});

test('room creation works', async () => {
  const response = await request.post('/api/rooms').send({ name: 'Test Room', floor: 'Floor 1', capacity: 6, status: 'available', sensor: 'AiSense X', tablet: 'Kiosk 99' });
  assert.equal(response.status, 201);
  assert.equal(response.body.name, 'Test Room');
  const room = await Room.findOne({ name: 'Test Room' });
  assert.ok(room);
});

test('smart room controls support manual and automatic modes', async () => {
  const room = await Room.findOne({ name: 'Meeting Room 2' });
  assert.ok(room);

  const manualResponse = await request
    .patch(`/api/rooms/${room._id}/controls`)
    .send({ mode: 'manual', lights: false, aircon: true, fan: true });

  assert.equal(manualResponse.status, 200);
  assert.deepEqual(
    {
      mode: manualResponse.body.smartControls.mode,
      lights: manualResponse.body.smartControls.lights,
      aircon: manualResponse.body.smartControls.aircon,
      fan: manualResponse.body.smartControls.fan,
    },
    { mode: 'manual', lights: false, aircon: true, fan: true }
  );

  const automaticResponse = await request
    .patch(`/api/rooms/${room._id}/controls`)
    .send({ mode: 'automatic' });

  assert.equal(automaticResponse.status, 200);
  assert.deepEqual(
    {
      mode: automaticResponse.body.smartControls.mode,
      lights: automaticResponse.body.smartControls.lights,
      aircon: automaticResponse.body.smartControls.aircon,
      fan: automaticResponse.body.smartControls.fan,
    },
    { mode: 'automatic', lights: true, aircon: true, fan: false }
  );
});

test('workflow templates can be created, updated, and removed', async () => {
  const createResponse = await request.post('/api/workflow-templates').send({
    name: 'Recruitment Interview',
    description: 'Interview room setup',
    durationMinutes: 45,
    bufferMinutes: 10,
  });
  assert.equal(createResponse.status, 201);
  assert.equal(createResponse.body.durationMinutes, 45);

  const updateResponse = await request.put(`/api/workflow-templates/${createResponse.body._id}`).send({
    name: 'Recruitment Interview',
    description: 'Panel interview room setup',
    durationMinutes: 60,
    bufferMinutes: 15,
  });
  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.durationMinutes, 60);

  const deleteResponse = await request.delete(`/api/workflow-templates/${createResponse.body._id}`);
  assert.equal(deleteResponse.status, 200);
  assert.equal(await WorkflowTemplate.exists({ _id: createResponse.body._id }), null);
});

test('meeting creation rejects overlapping bookings for the same room', async () => {
  const room = await Room.findOne({ name: 'Meeting Room 1' });
  assert.ok(room);
  await Meeting.create({
    title: 'Existing booking',
    roomId: room._id,
    status: 'upcoming',
    start: '10:00',
    end: '11:00',
    host: 'Test Host',
    date: '2030-01-15',
  });

  const conflictResponse = await request.post('/api/meetings').send({
    title: 'Overlapping booking',
    roomId: room._id.toString(),
    status: 'upcoming',
    start: '10:30',
    end: '11:30',
    host: 'Another Host',
    date: '2030-01-15',
  });
  assert.equal(conflictResponse.status, 409);
  assert.match(conflictResponse.body.error, /already booked/i);

  const adjacentResponse = await request.post('/api/meetings').send({
    title: 'Adjacent booking',
    roomId: room._id.toString(),
    status: 'upcoming',
    start: '11:00',
    end: '11:30',
    host: 'Another Host',
    date: '2030-01-15',
  });
  assert.equal(adjacentResponse.status, 201);
});
