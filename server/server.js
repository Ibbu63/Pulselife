const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Default Root Route
app.get('/', (req, res) => {
  res.json({
    message: '🩸 PulseLife Blood Bank API Server Running',
    status: 'OK',
    endpoints: ['/api/health', '/api/auth', '/api/inventory', '/api/donations', '/api/requests', '/api/admin']
  });
});

// Routes Imports
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const donationRoutes = require('./routes/donations');
const requestRoutes = require('./routes/requests');
const bloodBankRoutes = require('./routes/bloodBanks');
const hospitalRoutes = require('./routes/hospitals');
const notificationRoutes = require('./routes/notifications');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const reportRoutes = require('./routes/reports');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/blood-banks', bloodBankRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'PulseLife Blood Bank API', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Socket Connection
io.on('connection', (socket) => {
  console.log('⚡ Socket client connected:', socket.id);
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pulselife_bloodbank';

const startAppServer = async () => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🩸 PulseLife Blood Bank Server listening on port ${PORT}`);
    console.log(`====================================================`);
  });

  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 1500 });
    console.log('🌿 Connected to Local MongoDB!');
    const seedDatabase = require('./seed');
    await seedDatabase();
  } catch (err) {
    console.log('⚡ Using Fast In-Memory Store for instant zero-latency demo execution.');
  }
};

startAppServer();
