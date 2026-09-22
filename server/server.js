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
const MONGO_URI = process.env.MONGO_URI;

const startAppServer = async () => {
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🩸 PulseLife Blood Bank Server listening on port ${PORT}`);
    console.log(`====================================================`);
  });

  if (MONGO_URI && MONGO_URI.trim() !== '') {
    try {
      console.log('🔄 Connecting to MongoDB Cluster...');
      const maskedUri = MONGO_URI.replace(/:([^:@]+)@/, ':****@');
      console.log(`📡 Cluster URI: ${maskedUri}`);

      await mongoose.connect(MONGO_URI.trim(), {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000
      });
      console.log('🌿 Connected to MongoDB Cluster successfully!');

      const User = require('./models/User');
      const existingUsers = await User.countDocuments();
      if (existingUsers === 0) {
        console.log('🌱 Database is empty. Seeding initial baseline data into your MongoDB cluster...');
        const seedDatabase = require('./seed');
        await seedDatabase(false);
      } else {
        console.log(`📊 Found existing data in cluster (${existingUsers} users registered). Data preserved.`);
      }
    } catch (err) {
      console.error('❌ MongoDB Cluster Connection Error:', err.message);
      console.log('⚠️ Falling back to In-Memory Store for demo execution.');
      console.log('💡 Verification checklist:');
      console.log('   1. Check your MONGO_URI string in server/.env');
      console.log('   2. Ensure 0.0.0.0/0 (or your current IP) is added to Network Access in MongoDB Atlas');
      console.log('   3. Ensure database username and password in URI are correct (and URL-encoded if special chars exist)');
    }
  } else {
    console.log('⚠️ No MONGO_URI configured in server/.env.');
    console.log('⚡ Using Fast In-Memory Store for demo execution.');
    console.log('💡 Add your MongoDB Atlas cluster connection string to server/.env to store data permanently in your cluster.');
  }
};

startAppServer();
