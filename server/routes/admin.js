const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const memoryStore = require('../memoryStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/dashboard-stats', verifyToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    if (isDbConnected()) {
      const totalDonors = await User.countDocuments({ role: 'Donor' });
      const inventory = await BloodInventory.find({ status: 'Available' });
      const totalBloodUnits = inventory.reduce((sum, i) => sum + i.units, 0);
      const activeRequests = await BloodRequest.countDocuments({ status: { $in: ['Pending', 'Approved'] } });
      const pendingRequests = await BloodRequest.countDocuments({ status: 'Pending' });

      return res.json({
        totalDonors,
        totalBloodUnits,
        activeRequests,
        pendingRequests,
        totalHospitals: 8,
        totalBloodBanks: 4,
        bloodGroupDistribution: { 'A+': 18, 'O-': 12, 'B+': 25, 'AB+': 8, 'O+': 30, 'A-': 6 }
      });
    } else {
      const totalDonors = memoryStore.users.filter(u => u.role === 'Donor').length;
      const totalBloodUnits = memoryStore.inventory.reduce((sum, i) => sum + i.units, 0);
      const activeRequests = memoryStore.requests.length;

      return res.json({
        totalDonors,
        totalBloodUnits,
        activeRequests,
        pendingRequests: memoryStore.requests.filter(r => r.status === 'Pending').length,
        totalHospitals: memoryStore.hospitals.length,
        totalBloodBanks: memoryStore.bloodBanks.length,
        bloodGroupDistribution: { 'A+': 18, 'O-': 12, 'B+': 25, 'AB+': 8, 'O+': 30, 'A-': 6 }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error loading admin stats', error: error.message });
  }
});

router.get('/users', verifyToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    if (isDbConnected()) {
      const users = await User.find().select('-password');
      return res.json(users);
    } else {
      return res.json(memoryStore.users);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

router.delete('/users/:id', verifyToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    if (isDbConnected()) {
      await User.findByIdAndDelete(req.params.id);
    } else {
      memoryStore.users = memoryStore.users.filter(u => u._id !== req.params.id);
    }
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;
