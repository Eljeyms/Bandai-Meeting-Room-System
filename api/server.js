import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5173' }));
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  floor: { type: String, required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  sensor: { type: String, default: 'AiSense X' },
  tablet: { type: String, default: 'Kiosk' },
  aiDetected: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  smartControls: {
    mode: { type: String, enum: ['automatic', 'manual'], default: 'automatic' },
    lights: { type: Boolean, default: false },
    aircon: { type: Boolean, default: false },
    fan: { type: Boolean, default: false },
  },
});

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  status: { type: String, enum: ['ongoing', 'upcoming'], default: 'upcoming' },
  start: { type: String, required: true },
  end: { type: String, required: true },
  host: { type: String, required: true },
  date: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dept: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
  active: { type: Boolean, default: true },
});

const utilizationSchema = new mongoose.Schema({
  day: { type: String, required: true },
  pct: { type: Number, required: true },
});

const workflowTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  durationMinutes: { type: Number, required: true, min: 15 },
  bufferMinutes: { type: Number, default: 0, min: 0 },
});

const Room = mongoose.model('Room', roomSchema);
const Meeting = mongoose.model('Meeting', meetingSchema);
const User = mongoose.model('User', userSchema);
const Utilization = mongoose.model('Utilization', utilizationSchema);
const WorkflowTemplate = mongoose.model('WorkflowTemplate', workflowTemplateSchema);

const seedData = async () => {
  const rooms = [
    { name: 'Meeting Room 1', floor: 'Tower A · 1st floor', capacity: 6, status: 'available', sensor: 'AiSense X', tablet: 'Kiosk 01', aiDetected: false, smartControls: { mode: 'automatic', lights: false, aircon: false, fan: false } },
    { name: 'Meeting Room 2', floor: 'Tower A · 2nd floor', capacity: 8, status: 'occupied', sensor: 'AiSense X', tablet: 'Kiosk 02', aiDetected: true, smartControls: { mode: 'automatic', lights: true, aircon: true, fan: false } },
    { name: 'Meeting Room 3', floor: 'Tower B · 3rd floor', capacity: 10, status: 'occupied', sensor: 'AiSense X', tablet: 'Kiosk 03', aiDetected: true, smartControls: { mode: 'automatic', lights: true, aircon: true, fan: false } },
    { name: 'Meeting Room 4', floor: 'Tower B · 4th floor', capacity: 12, status: 'available', sensor: 'AiSense X', tablet: 'Kiosk 04', aiDetected: false, smartControls: { mode: 'automatic', lights: false, aircon: false, fan: false } },
    { name: 'Meeting Room 3B', floor: 'Tower A · 5th floor', capacity: 8, status: 'available', sensor: 'AiSense X', tablet: 'Kiosk 05', aiDetected: false, smartControls: { mode: 'automatic', lights: false, aircon: false, fan: false } },
    { name: 'Studio 2F', floor: 'Tower A · 2nd floor', capacity: 10, status: 'occupied', sensor: 'AiSense X', tablet: 'Kiosk 06', aiDetected: true, smartControls: { mode: 'automatic', lights: true, aircon: true, fan: false } },
    { name: 'Boardroom 5A', floor: 'Tower B · 7th floor', capacity: 14, status: 'occupied', sensor: 'AiSense X', tablet: 'Kiosk 07', aiDetected: true, smartControls: { mode: 'automatic', lights: true, aircon: true, fan: false } },
    { name: 'Focus Suite 1C', floor: 'Tower B · 3rd floor', capacity: 6, status: 'available', sensor: 'AiSense X', tablet: 'Kiosk 08', aiDetected: false, smartControls: { mode: 'automatic', lights: false, aircon: false, fan: false } },
  ];

  const roomOps = rooms.map((room) => ({
    updateOne: {
      filter: { name: room.name },
      update: { $set: room },
      upsert: true,
    },
  }));
  await Room.bulkWrite(roomOps);

  const createdRooms = await Room.find({ name: { $in: rooms.map((room) => room.name) } }).lean();
  const roomMap = Object.fromEntries(createdRooms.map((room) => [room.name, room]));

  const meetings = [
    { title: 'Design Critique', roomId: roomMap['Studio 2F']?._id, status: 'ongoing', start: '12:30', end: '13:30', host: 'S. Takahashi', date: '2026-07-27' },
    { title: 'Team Sync', roomId: roomMap['Boardroom 5A']?._id, status: 'upcoming', start: '14:00', end: '14:30', host: 'J. Kubota', date: '2026-07-27' },
    { title: 'Project Kickoff', roomId: roomMap['Meeting Room 1']?._id, status: 'upcoming', start: '15:00', end: '16:00', host: 'M. Fujita', date: '2026-07-27' },
    { title: 'UX Review', roomId: roomMap['Meeting Room 4']?._id, status: 'upcoming', start: '16:30', end: '17:15', host: 'A. Mori', date: '2026-07-27' },
  ].filter((meeting) => meeting.roomId);

  await Meeting.deleteMany({ title: { $in: meetings.map((meeting) => meeting.title) } });
  await Meeting.insertMany(meetings);

  const users = [
    { name: 'Sora Tanaka', email: 'sora.tanaka@bandai.com', dept: 'Design', role: 'Admin', active: true },
    { name: 'Kenji Ito', email: 'kenji.ito@bandai.com', dept: 'Engineering', role: 'Member', active: true },
    { name: 'Mika Sato', email: 'mika.sato@bandai.com', dept: 'Operations', role: 'Member', active: false },
    { name: 'Hiroko Yamazaki', email: 'hiroko.yamazaki@bandai.com', dept: 'Marketing', role: 'Member', active: true },
  ];
  await User.deleteMany({ email: { $in: users.map((user) => user.email) } });
  await User.insertMany(users);

  const utilization = [
    { day: 'Mon', pct: 68 },
    { day: 'Tue', pct: 74 },
    { day: 'Wed', pct: 59 },
    { day: 'Thu', pct: 81 },
    { day: 'Fri', pct: 66 },
  ];
  await Utilization.deleteMany({ day: { $in: utilization.map((item) => item.day) } });
  await Utilization.insertMany(utilization);

  const workflowTemplates = [
    { name: 'Standard Meeting', description: 'General team meeting', durationMinutes: 30, bufferMinutes: 5 },
    { name: 'Client Presentation', description: 'Presentation-ready setup', durationMinutes: 60, bufferMinutes: 15 },
    { name: 'Team Workshop', description: 'Long-form collaboration session', durationMinutes: 120, bufferMinutes: 15 },
    { name: 'Quick Huddle', description: 'Short discussion', durationMinutes: 15, bufferMinutes: 0 },
  ];
  await WorkflowTemplate.bulkWrite(workflowTemplates.map((template) => ({
    updateOne: {
      filter: { name: template.name },
      update: { $setOnInsert: template },
      upsert: true,
    },
  })));
};

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api', async (req, res, next) => {
  try {
    await ensureDb(req, res, next);
  } catch (error) {
    next(error);
  }
});

app.get('/api/rooms', async (_req, res) => {
  const rooms = await Room.find().lean();
  res.json(rooms);
});

app.post('/api/rooms', async (req, res) => {
  const room = await Room.create(req.body);
  io.emit('rooms:updated', room);
  res.status(201).json(room);
});

app.put('/api/rooms/:id', async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!room) return res.status(404).json({ error: 'Room not found' });
  io.emit('rooms:updated', room);
  res.json(room);
});

app.patch('/api/rooms/:id/controls', async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const { mode, lights, aircon, fan } = req.body;
  if (mode && !['automatic', 'manual'].includes(mode)) {
    return res.status(400).json({ error: 'Control mode must be automatic or manual' });
  }

  if (mode === 'automatic') {
    const occupied = room.status === 'occupied';
    room.smartControls = { mode: 'automatic', lights: occupied, aircon: occupied, fan: false };
  } else {
    room.smartControls.mode = mode || room.smartControls.mode;
    if (typeof lights === 'boolean') room.smartControls.lights = lights;
    if (typeof aircon === 'boolean') room.smartControls.aircon = aircon;
    if (typeof fan === 'boolean') room.smartControls.fan = fan;
  }

  room.lastUpdated = new Date();
  await room.save();
  io.emit('rooms:updated', room);
  res.json(room);
});

app.delete('/api/rooms/:id', async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  io.emit('rooms:updated', room);
  res.json({ success: true });
});

app.get('/api/meetings', async (_req, res) => {
  const meetings = await Meeting.find().lean();
  res.json(meetings);
});

const findMeetingConflict = async ({ roomId, date, start, end }, excludeId) => {
  if (!roomId || !date || !start || !end) return null;
  const query = {
    roomId,
    date,
    start: { $lt: end },
    end: { $gt: start },
  };
  if (excludeId) query._id = { $ne: excludeId };
  return Meeting.findOne(query).lean();
};

app.post('/api/meetings', async (req, res) => {
  const conflict = await findMeetingConflict(req.body);
  if (conflict) {
    return res.status(409).json({
      error: 'This room is already booked during the selected time.',
      conflict,
    });
  }
  const meeting = await Meeting.create(req.body);
  io.emit('meetings:updated', meeting);
  res.status(201).json(meeting);
});

app.put('/api/meetings/:id', async (req, res) => {
  const existing = await Meeting.findById(req.params.id).lean();
  if (!existing) return res.status(404).json({ error: 'Meeting not found' });
  const candidate = { ...existing, ...req.body };
  const conflict = await findMeetingConflict(candidate, req.params.id);
  if (conflict) {
    return res.status(409).json({
      error: 'This room is already booked during the selected time.',
      conflict,
    });
  }
  const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  io.emit('meetings:updated', meeting);
  res.json(meeting);
});

app.delete('/api/meetings/:id', async (req, res) => {
  const meeting = await Meeting.findByIdAndDelete(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  io.emit('meetings:updated', meeting);
  res.json({ success: true });
});

app.get('/api/workflow-templates', async (_req, res) => {
  const templates = await WorkflowTemplate.find().sort({ name: 1 }).lean();
  res.json(templates);
});

app.post('/api/workflow-templates', async (req, res) => {
  const template = await WorkflowTemplate.create(req.body);
  io.emit('templates:updated', template);
  res.status(201).json(template);
});

app.put('/api/workflow-templates/:id', async (req, res) => {
  const template = await WorkflowTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!template) return res.status(404).json({ error: 'Workflow template not found' });
  io.emit('templates:updated', template);
  res.json(template);
});

app.delete('/api/workflow-templates/:id', async (req, res) => {
  const template = await WorkflowTemplate.findByIdAndDelete(req.params.id);
  if (!template) return res.status(404).json({ error: 'Workflow template not found' });
  io.emit('templates:updated', template);
  res.json({ success: true });
});

app.get('/api/users', async (_req, res) => {
  const users = await User.find().lean();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body);
  io.emit('users:updated', user);
  res.status(201).json(user);
});

app.put('/api/users/:id', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  io.emit('users:updated', user);
  res.json(user);
});

app.get('/api/utilization', async (_req, res) => {
  const data = await Utilization.find().lean();
  res.json(data);
});

app.post('/api/ai/detect', async (req, res) => {
  const { roomId } = req.body;
  if (!roomId) return res.status(400).json({ error: 'roomId is required' });
  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  room.aiDetected = !room.aiDetected;
  room.status = room.aiDetected ? 'occupied' : 'available';
  room.lastUpdated = new Date();
  await room.save();
  io.emit('rooms:updated', room);
  res.json(room);
});

app.get('/api/dashboard', async (_req, res) => {
  const [rooms, meetings, users, utilization, workflowTemplates] = await Promise.all([
    Room.find().lean(),
    Meeting.find().lean(),
    User.find().lean(),
    Utilization.find().lean(),
    WorkflowTemplate.find().sort({ name: 1 }).lean(),
  ]);
  res.json({ rooms, meetings, users, utilization, workflowTemplates });
});

app.get('/api/rooms/:id', async (req, res) => {
  const room = await Room.findById(req.params.id).lean();
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => socket.join(roomId));
  socket.on('disconnect', () => {});
});

let dbReady = false;
let memoryServer;
let connectPromise = null;

const connectDb = async () => {
  if (dbReady || mongoose.connection.readyState === 1) {
    dbReady = true;
    return;
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = (async () => {
    const uri = process.env.MONGODB_URI;
    try {
      if (uri) {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        await seedData();
        dbReady = true;
        console.log('MongoDB connected');
        return;
      }

      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri, { serverSelectionTimeoutMS: 5000 });
      await seedData();
      dbReady = true;
      console.log('MongoDB connected to in-memory server');
    } catch (error) {
      console.error('MongoDB connection failed', error.message);
    }
  })();

  try {
    await connectPromise;
  } finally {
    connectPromise = null;
  }
};

const startServer = async () => {
  await connectDb();
  const port = process.env.PORT || 4000;
  httpServer.listen(port, () => console.log(`Backend listening on port ${port}`));
};

const ensureDb = async (_req, res, next) => {
  if (!dbReady) {
    await connectDb();
  }
  if (!dbReady) {
    return res.status(503).json({ error: 'Database is not ready. Please try again shortly.' });
  }
  next();
};

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  startServer();
}

export { app, io, Room, Meeting, User, Utilization, WorkflowTemplate, seedData, startServer, connectDb, memoryServer };
