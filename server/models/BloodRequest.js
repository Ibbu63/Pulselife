const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
    required: true 
  },
  units: { type: Number, required: true, min: 1 },
  urgency: { 
    type: String, 
    enum: ['Normal', 'Urgent', 'Emergency'], 
    default: 'Normal' 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Fulfilled', 'Rejected'], 
    default: 'Pending' 
  },
  reason: { type: String, required: true },
  requestedDate: { type: Date, default: Date.now },
  assignedBloodBankId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank', default: null }
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
