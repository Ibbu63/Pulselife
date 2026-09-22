const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodBankId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank', required: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
    required: true 
  },
  units: { type: Number, required: true, default: 1 },
  date: { type: Date, default: Date.now },
  testStatus: { 
    type: String, 
    enum: ['Pending', 'Passed', 'Failed'], 
    default: 'Pending' 
  },
  accepted: { type: Boolean, default: false },
  remarks: { type: String, default: '' }
});

module.exports = mongoose.model('Donation', donationSchema);
