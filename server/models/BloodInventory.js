const mongoose = require('mongoose');

const bloodInventorySchema = new mongoose.Schema({
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
    required: true 
  },
  units: { type: Number, required: true, min: 0 },
  expiryDate: { type: Date, required: true },
  bloodBankId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank', required: true },
  status: { 
    type: String, 
    enum: ['Available', 'Expired', 'Reserved'], 
    default: 'Available' 
  },
  addedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BloodInventory', bloodInventorySchema);
