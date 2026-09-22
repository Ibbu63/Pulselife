// MongoDB Cluster Diagnostic & Verification Script
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const BloodBank = require('./models/BloodBank');
const Hospital = require('./models/Hospital');
const BloodInventory = require('./models/BloodInventory');
const Donation = require('./models/Donation');
const BloodRequest = require('./models/BloodRequest');
const Appointment = require('./models/Appointment');
const Notification = require('./models/Notification');

async function testConnection() {
  const uri = process.env.MONGO_URI;

  console.log('====================================================');
  console.log('🩺 PulseLife MongoDB Cluster Verification Utility');
  console.log('====================================================');

  if (!uri || uri.trim() === '') {
    console.error('❌ ERROR: MONGO_URI is missing or empty in server/.env');
    console.log('\n👉 Instructions:');
    console.log('1. Open server/.env');
    console.log('2. Set MONGO_URI=your_mongodb_cluster_connection_string');
    console.log('   Example: mongodb+srv://myUser:myPassword@cluster0.abcde.mongodb.net/pulselife_bloodbank?retryWrites=true&w=majority');
    console.log('3. Run "node test-db.js" again.');
    process.exit(1);
  }

  const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
  console.log(`📡 Target Cluster URI: ${maskedUri}`);
  console.log('🔄 Attempting connection (15s timeout)...');

  try {
    const startTime = Date.now();
    await mongoose.connect(uri.trim(), {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000
    });
    const duration = Date.now() - startTime;
    console.log(`✅ SUCCESS: Connected to MongoDB Cluster in ${duration}ms!`);
    console.log(`📦 Database Name: "${mongoose.connection.name}"`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log('\n📊 Collection Statistics:');

    const [
      users,
      bloodBanks,
      hospitals,
      inventory,
      donations,
      requests,
      appointments,
      notifications
    ] = await Promise.all([
      User.countDocuments(),
      BloodBank.countDocuments(),
      Hospital.countDocuments(),
      BloodInventory.countDocuments(),
      Donation.countDocuments(),
      BloodRequest.countDocuments(),
      Appointment.countDocuments(),
      Notification.countDocuments()
    ]);

    console.log(`   - Users:              ${users}`);
    console.log(`   - Blood Banks:        ${bloodBanks}`);
    console.log(`   - Hospitals:          ${hospitals}`);
    console.log(`   - Blood Inventory:    ${inventory}`);
    console.log(`   - Donations:          ${donations}`);
    console.log(`   - Blood Requests:     ${requests}`);
    console.log(`   - Appointments:       ${appointments}`);
    console.log(`   - Notifications:      ${notifications}`);

    if (users === 0) {
      console.log('\n🌱 Note: Database is currently empty.');
      console.log('💡 Run "npm run seed" in the server folder if you wish to populate initial demo data.');
    } else {
      console.log('\n✅ Your MongoDB cluster already contains live data. Data is ready for application use!');
    }

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected safely.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ FAILED TO CONNECT TO MONGODB CLUSTER:');
    console.error(err.message);
    console.log('\n🔧 Troubleshooting Guide:');
    console.log('1. IP Access List (Whitelist):');
    console.log('   Go to MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0) or add your current public IP.');
    console.log('2. User Credentials:');
    console.log('   Ensure the username and password in MONGO_URI match a user created under Database Access in MongoDB Atlas.');
    console.log('3. Special Characters:');
    console.log('   If your password contains special characters (like @, #, $, %), URL-encode them (e.g., @ becomes %40).');
    console.log('4. Database Name:');
    console.log('   Ensure the URI ends with a database name, e.g., ...mongodb.net/pulselife_bloodbank?retryWrites=true&w=majority');
    process.exit(1);
  }
}

testConnection();
