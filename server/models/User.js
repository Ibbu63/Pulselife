const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Donor', 'Hospital', 'Blood Bank'], 
    required: true 
  },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], 
    default: '' 
  },
  age: { type: Number, default: 0 },
  gender: { type: String, default: 'Unspecified' },
  isVerified: { type: Boolean, default: true },
  lastDonationDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
