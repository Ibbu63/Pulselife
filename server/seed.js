const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const BloodBank = require('./models/BloodBank');
const Hospital = require('./models/Hospital');
const BloodInventory = require('./models/BloodInventory');
const Donation = require('./models/Donation');
const BloodRequest = require('./models/BloodRequest');
const Notification = require('./models/Notification');
const Appointment = require('./models/Appointment');

const seedDatabase = async (forceClear = true) => {
  try {
    if (!forceClear) {
      const existingCount = await User.countDocuments();
      if (existingCount > 0) {
        console.log(`ℹ️ Cluster already contains ${existingCount} users. Preserving existing data and skipping seed.`);
        return;
      }
    }

    console.log('🌱 Starting database seeding into MongoDB Cluster...');

    // Clear existing data only when forced or when database is empty
    await User.deleteMany({});
    await BloodBank.deleteMany({});
    await Hospital.deleteMany({});
    await BloodInventory.deleteMany({});
    await Donation.deleteMany({});
    await BloodRequest.deleteMany({});
    await Notification.deleteMany({});
    await Appointment.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);

    // 1. Create Super Admin
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@pulselife.com',
      password: adminPassword,
      role: 'Admin',
      phone: '+91 9865237417',
      address: '41, Peter`s road , OMR, Chennai, Tamil Nadu',
      bloodGroup: 'O+',
      age: 35,
      gender: 'Male',
      isVerified: true
    });

    // 2. Create Blood Bank Users & Entities
    const bbUser1 = await User.create({
      name: 'Chennai Blood Centre',
      email: 'cbc@pulselife.com',
      password: defaultPassword,
      role: 'Blood Bank',
      phone: '+91 96007 75352',
      address: '70 Sindhoor Complex, Anna Nagar, Chennai, Tamil Nadu',
      isVerified: true
    });

    const bloodBank1 = await BloodBank.create({
      name: 'Chennai Blood Centre',
      address: '70 Sindhoor Complex, Anna Nagar, Chennai, Tamil Nadu',
      contact: '+91 96007 75352',
      license: 'BB-LIC-88901',
      userId: bbUser1._id
    });

    const bbUser2 = await User.create({
      name: 'Dhanvandri Blood Bank',
      email: 'dbc@pulselife.com',
      password: defaultPassword,
      role: 'Blood Bank',
      phone: '+91 44 2431 0660',
      address: '52A S W Boag Road, T Nagar, Chennai, Tamil Nadu',
      isVerified: true
    });

    const bloodBank2 = await BloodBank.create({
      name: 'Dhanvandri Blood Bank',
      address: '52A S W Boag Road, T Nagar, Chennai, Tamil Nadu',
      contact: '+91 44 2431 0660',
      license: 'BB-LIC-44312',
      userId: bbUser2._id
    });

    // 3. Create Hospital Users & Entities
    const hospUser1 = await User.create({
      name: 'R.G Hospital',
      email: 'rghospital@pulselife.com',
      password: defaultPassword,
      role: 'Hospital',
      phone: '+91 44 2530 5000',
      address: '3/204, EVR Periyar Salai, Chennai, Tamil Nadu',
      isVerified: true
    });

    const hospital1 = await Hospital.create({
      name: 'R.G Hospital',
      email: 'rghospital@pulselife.com',
      phone: '+91 44 2530 5000',
      address: '3/204, EVR Periyar Salai, Chennai, Tamil Nadu',
      licenseNumber: 'HOSP-NY-9021',
      userId: hospUser1._id
    });

    const hospUser2 = await User.create({
      name: 'Govt HQ Hospital',
      email: 'govthq@pulselife.com',
      password: defaultPassword,
      role: 'Hospital',
      phone: '+91 04329 224 050',
      address: '1, Rajajinagar, Ariyalur, Tamil Nadu',
      isVerified: true
    });

    const hospital2 = await Hospital.create({
      name: 'Govt HQ Hospital',
      email: 'govthq@pulselife.com',
      phone: '+91 04329 224 050',
      address: '1, Rajajinagar, Ariyalur, Tamil Nadu',
      licenseNumber: 'HOSP-NY-4102',
      userId: hospUser2._id
    });

    // 4. Create Donors
    const donor1 = await User.create({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: defaultPassword,
      role: 'Donor',
      phone: '+1 (555) 111-2222',
      address: '14 Park Ave, New York, NY',
      bloodGroup: 'A+',
      age: 28,
      gender: 'Male',
      isVerified: true,
      lastDonationDate: new Date('2026-05-10')
    });

    const donor2 = await User.create({
      name: 'Sarah Smith',
      email: 'sarah.smith@gmail.com',
      password: defaultPassword,
      role: 'Donor',
      phone: '+1 (555) 333-4444',
      address: '88 Atlantic Ave, Brooklyn, NY',
      bloodGroup: 'O-',
      age: 32,
      gender: 'Female',
      isVerified: true,
      lastDonationDate: null // Never donated / universal donor available
    });

    const donor3 = await User.create({
      name: 'Michael Johnson',
      email: 'mike.johnson@gmail.com',
      password: defaultPassword,
      role: 'Donor',
      phone: '+1 (555) 555-6666',
      address: '212 Queens Blvd, Queens, NY',
      bloodGroup: 'B+',
      age: 45,
      gender: 'Male',
      isVerified: true,
      lastDonationDate: new Date('2026-03-15')
    });

    const donor4 = await User.create({
      name: 'Emily Davis',
      email: 'emily.davis@gmail.com',
      password: defaultPassword,
      role: 'Donor',
      phone: '+1 (555) 777-8888',
      address: '304 Fulton St, Brooklyn, NY',
      bloodGroup: 'AB+',
      age: 24,
      gender: 'Female',
      isVerified: true
    });

    // 5. Populate Blood Inventory Units
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const now = new Date();

    for (const group of bloodGroups) {
      // Future expiry date (30-40 days from now)
      const validExpiry = new Date(now);
      validExpiry.setDate(validExpiry.getDate() + Math.floor(Math.random() * 30) + 10);

      await BloodInventory.create({
        bloodGroup: group,
        units: Math.floor(Math.random() * 15) + 5,
        expiryDate: validExpiry,
        bloodBankId: bloodBank1._id,
        status: 'Available'
      });

      await BloodInventory.create({
        bloodGroup: group,
        units: Math.floor(Math.random() * 10) + 3,
        expiryDate: validExpiry,
        bloodBankId: bloodBank2._id,
        status: 'Available'
      });
    }

    // Add 1 Expired item for testing cleanup
    const pastExpiry = new Date(now);
    pastExpiry.setDate(pastExpiry.getDate() - 5);
    await BloodInventory.create({
      bloodGroup: 'B-',
      units: 2,
      expiryDate: pastExpiry,
      bloodBankId: bloodBank1._id,
      status: 'Expired'
    });

    // 6. Create Sample Donations
    await Donation.create({
      donorId: donor1._id,
      bloodBankId: bloodBank1._id,
      bloodGroup: 'A+',
      units: 1,
      date: new Date('2026-05-10'),
      testStatus: 'Passed',
      accepted: true,
      remarks: 'Whole blood donation passed screening.'
    });

    await Donation.create({
      donorId: donor3._id,
      bloodBankId: bloodBank2._id,
      bloodGroup: 'B+',
      units: 1,
      date: new Date('2026-07-28'),
      testStatus: 'Pending',
      accepted: true,
      remarks: 'Lab test in progress.'
    });

    // 7. Create Sample Blood Requests
    await BloodRequest.create({
      hospitalId: hospital1._id,
      bloodGroup: 'O-',
      units: 3,
      urgency: 'Emergency',
      status: 'Pending',
      reason: 'Urgent trauma surgery patient in ICU.',
      requestedDate: new Date(),
      assignedBloodBankId: bloodBank1._id
    });

    await BloodRequest.create({
      hospitalId: hospital2._id,
      bloodGroup: 'A+',
      units: 2,
      urgency: 'Normal',
      status: 'Approved',
      reason: 'Scheduled elective cardiac bypass surgery.',
      requestedDate: new Date(Date.now() - 86400000),
      assignedBloodBankId: bloodBank1._id
    });

    // 8. Create Sample Appointments
    await Appointment.create({
      donorId: donor2._id,
      bloodBankId: bloodBank1._id,
      appointmentDate: new Date(Date.now() + 86400000 * 3),
      timeSlot: '10:30 AM',
      status: 'Scheduled',
      notes: 'First time donor.'
    });

    // 9. Sample Notifications
    await Notification.create({
      receiverId: donor2._id,
      message: '🚨 EMERGENCY ALERT: O- blood needed urgently at R.G Hospital! Can you donate?',
      type: 'Emergency'
    });

    await Notification.create({
      receiverId: adminUser._id,
      message: 'System initialization complete. All blood banks and hospitals synced.',
      type: 'System'
    });

    console.log('✅ Seeding complete successfully!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

if (require.main === module) {
  require('dotenv').config();
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('❌ Error: MONGO_URI is not set in server/.env');
    process.exit(1);
  }
  const maskedUri = MONGO_URI.replace(/:([^:@]+)@/, ':****@');
  console.log(`Connecting to MongoDB Cluster: ${maskedUri}`);
  mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000, connectTimeoutMS: 15000 })
    .then(async () => {
      console.log('🌿 Connected to MongoDB Cluster successfully.');
      await seedDatabase(true);
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB. Seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeding failed to connect to MongoDB Cluster:', err.message);
      process.exit(1);
    });
}

module.exports = seedDatabase;
