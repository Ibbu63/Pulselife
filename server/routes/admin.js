const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');
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
      const totalHospitals = await Hospital.countDocuments();
      const totalBloodBanks = await BloodBank.countDocuments();

      const bloodGroupDistribution = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 };
      inventory.forEach(i => {
        if (bloodGroupDistribution[i.bloodGroup] !== undefined) {
          bloodGroupDistribution[i.bloodGroup] += i.units;
        }
      });

      return res.json({
        totalDonors,
        totalBloodUnits,
        activeRequests,
        pendingRequests,
        totalHospitals,
        totalBloodBanks,
        bloodGroupDistribution
      });
    } else {
      const totalDonors = memoryStore.users.filter(u => u.role === 'Donor').length;
      const totalBloodUnits = memoryStore.inventory.reduce((sum, i) => sum + i.units, 0);
      const activeRequests = memoryStore.requests.length;

      const bloodGroupDistribution = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 };
      memoryStore.inventory.forEach(i => {
        if (i.status === 'Available' && bloodGroupDistribution[i.bloodGroup] !== undefined) {
          bloodGroupDistribution[i.bloodGroup] += i.units;
        }
      });

      return res.json({
        totalDonors,
        totalBloodUnits,
        activeRequests,
        pendingRequests: memoryStore.requests.filter(r => r.status === 'Pending').length,
        totalHospitals: memoryStore.hospitals.length,
        totalBloodBanks: memoryStore.bloodBanks.length,
        bloodGroupDistribution
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
