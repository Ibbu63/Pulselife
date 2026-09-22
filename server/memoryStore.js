// Fast In-Memory Database Store for Instant Execution
const memoryStore = {
  users: [
    {
      _id: 'usr_admin',
      name: 'Super Admin',
      email: 'admin@pulselife.com',
      password: '$2a$10$wT.N1S6nKqgZtF1zG2y1.e71j6k5l4m3n2o1p0q9r8s7t6u5v4', // 'admin123'
      role: 'Admin',
      phone: '+1 (555) 019-2831',
      address: '777 Life Tower, NY',
      bloodGroup: 'O+',
      age: 35,
      gender: 'Male',
      isVerified: true,
      createdAt: new Date()
    },
    {
      _id: 'usr_bb1',
      name: 'Chennai Blood Centre',
      email: 'cbc@pulselife.com',
      password: '$2a$10$wT.N1S6nKqgZtF1zG2y1.e71j6k5l4m3n2o1p0q9r8s7t6u5v4', // 'password123'
      role: 'Blood Bank',
      phone: '+1 (555) 342-8800',
      address: '102 Medical Plaza, New York, NY',
      isVerified: true
    },
    {
      _id: 'usr_hosp1',
      name: 'R.G Hospital',
      email: 'rghospital@pulselife.com',
      password: '$2a$10$wT.N1S6nKqgZtF1zG2y1.e71j6k5l4m3n2o1p0q9r8s7t6u5v4',
      role: 'Hospital',
      phone: '+1 (555) 234-5678',
      address: '500 Grand Ave, New York, NY',
      isVerified: true
    },
    {
      _id: 'usr_donor1',
      name: 'Sarah Smith',
      email: 'sarah.smith@gmail.com',
      password: '$2a$10$wT.N1S6nKqgZtF1zG2y1.e71j6k5l4m3n2o1p0q9r8s7t6u5v4',
      role: 'Donor',
      phone: '+1 (555) 333-4444',
      address: '88 Atlantic Ave, Brooklyn, NY',
      bloodGroup: 'O-',
      age: 32,
      gender: 'Female',
      isVerified: true,
      lastDonationDate: null
    },
    {
      _id: 'usr_donor2',
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      password: '$2a$10$wT.N1S6nKqgZtF1zG2y1.e71j6k5l4m3n2o1p0q9r8s7t6u5v4',
      role: 'Donor',
      phone: '+1 (555) 111-2222',
      address: '14 Park Ave, New York, NY',
      bloodGroup: 'A+',
      age: 28,
      gender: 'Male',
      isVerified: true,
      lastDonationDate: new Date('2026-05-10')
    }
  ],

  bloodBanks: [
    {
      _id: 'bb_1',
      name: 'Chennai Blood Centre',
      address: '70 Sindhoor Complex, Anna Nagar, Chennai, Tamil Nadu',
      contact: '+91 96007 75352',
      license: 'BB-LIC-88901',
      userId: 'usr_bb1'
    },
    {
      _id: 'bb_2',
      name: 'Dhanvandri Blood Bank',
      address: '52A S W Boag Road, T Nagar, Chennai, Tamil Nadu',
      contact: '+91 44 2431 0660',
      license: 'BB-LIC-44312',
      userId: 'usr_bb2'
    }
  ],

  hospitals: [
    {
      _id: 'hosp_1',
      name: 'R.G Hospital',
      email: 'rghospital@pulselife.com',
      phone: '+91 44 2530 5000',
      address: '3/204, EVR Periyar Salai, Chennai, Tamil Nadu',
      licenseNumber: 'HOSP-NY-9021',
      userId: 'usr_hosp1'
    },
    {
      _id: 'hosp_2',
      name: 'Govt HQ Hospital',
      email: 'govthq@pulselife.com',
      phone: '+91 04329 224 050',
      address: '1, Rajajinagar, Ariyalur, Tamil Nadu',
      licenseNumber: 'HOSP-NY-4102',
      userId: 'usr_hosp2'
    }
  ],

  inventory: [
    { _id: 'inv_1', bloodGroup: 'A+', units: 18, expiryDate: new Date(Date.now() + 86400000 * 30), bloodBankId: { _id: 'bb_1', name: 'Chennai Blood Centre', address: '102 Medical Plaza, New York, NY' }, status: 'Available' },
    { _id: 'inv_2', bloodGroup: 'O-', units: 12, expiryDate: new Date(Date.now() + 86400000 * 25), bloodBankId: { _id: 'bb_1', name: 'Chennai Blood Centre', address: '102 Medical Plaza, New York, NY' }, status: 'Available' },
    { _id: 'inv_3', bloodGroup: 'B+', units: 25, expiryDate: new Date(Date.now() + 86400000 * 20), bloodBankId: { _id: 'bb_2', name: 'Dhanvandri Blood Bank', address: '45 Red Cross Way, Brooklyn, NY' }, status: 'Available' },
    { _id: 'inv_4', bloodGroup: 'AB+', units: 8, expiryDate: new Date(Date.now() + 86400000 * 15), bloodBankId: { _id: 'bb_1', name: 'Chennai Blood Centre', address: '102 Medical Plaza, New York, NY' }, status: 'Available' },
    { _id: 'inv_5', bloodGroup: 'O+', units: 30, expiryDate: new Date(Date.now() + 86400000 * 35), bloodBankId: { _id: 'bb_2', name: 'Dhanvandri Blood Bank', address: '45 Red Cross Way, Brooklyn, NY' }, status: 'Available' },
    { _id: 'inv_6', bloodGroup: 'A-', units: 6, expiryDate: new Date(Date.now() + 86400000 * 10), bloodBankId: { _id: 'bb_1', name: 'Chennai Blood Centre', address: '102 Medical Plaza, New York, NY' }, status: 'Available' }
  ],

  donations: [
    { _id: 'don_1', donorId: { _id: 'usr_donor2', name: 'John Doe', email: 'john.doe@gmail.com', bloodGroup: 'A+' }, bloodBankId: { _id: 'bb_1', name: 'Chennai Blood Centre' }, bloodGroup: 'A+', units: 1, date: new Date('2026-05-10'), testStatus: 'Passed', accepted: true },
    { _id: 'don_2', donorId: { _id: 'usr_donor1', name: 'Sarah Smith', email: 'sarah.smith@gmail.com', bloodGroup: 'O-' }, bloodBankId: { _id: 'bb_1', name: 'Chennai Blood Centre' }, bloodGroup: 'O-', units: 1, date: new Date('2026-07-28'), testStatus: 'Pending', accepted: true }
  ],

  requests: [
    { _id: 'req_1', hospitalId: { _id: 'hosp_1', name: 'R.G Hospital', address: '500 Grand Ave, NY' }, bloodGroup: 'O-', units: 3, urgency: 'Emergency', status: 'Pending', reason: 'Urgent trauma surgery patient in ICU.', requestedDate: new Date() },
    { _id: 'req_2', hospitalId: { _id: 'hosp_2', name: 'Govt HQ Hospital', address: '12 Health Blvd' }, bloodGroup: 'A+', units: 2, urgency: 'Normal', status: 'Approved', reason: 'Elective cardiac bypass surgery.', requestedDate: new Date(Date.now() - 86400000) }
  ],

  appointments: [
    { _id: 'apt_1', donorId: { _id: 'usr_donor1', name: 'Sarah Smith' }, bloodBankId: { _id: 'bb_1', name: 'Chennai Blood Centre' }, appointmentDate: new Date(Date.now() + 86400000 * 3), timeSlot: '10:30 AM', status: 'Scheduled' }
  ],

  notifications: [
    { _id: 'notif_1', receiverId: 'usr_donor1', message: '🚨 EMERGENCY ALERT: O- blood needed urgently at R.G Hospital!', type: 'Emergency', read: false, createdAt: new Date() },
    { _id: 'notif_2', receiverId: 'usr_admin', message: 'System initialization complete. All blood banks and hospitals synced.', type: 'System', read: false, createdAt: new Date() }
  ]
};

module.exports = memoryStore;
