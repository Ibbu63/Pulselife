const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BloodInventory = require('../models/BloodInventory');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const memoryStore = require('../memoryStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Get report data
router.get('/:type', verifyToken, authorizeRoles('Blood Bank', 'Admin'), async (req, res) => {
  try {
    const { type } = req.params;
    let reportData = [];

    if (isDbConnected()) {
      if (type === 'donation') {
        reportData = await Donation.find()
          .populate('donorId', 'name email phone bloodGroup')
          .populate('bloodBankId', 'name address')
          .sort({ date: -1 });
      } else if (type === 'stock') {
        reportData = await BloodInventory.find()
          .populate('bloodBankId', 'name address contact')
          .sort({ expiryDate: 1 });
      } else if (type === 'hospital') {
        reportData = await BloodRequest.find()
          .populate('hospitalId', 'name email phone address')
          .populate('assignedBloodBankId', 'name')
          .sort({ requestedDate: -1 });
      } else {
        // Monthly / Annual Summary
        const donations = await Donation.countDocuments();
        const requests = await BloodRequest.countDocuments();
        const fulfilled = await BloodRequest.countDocuments({ status: 'Fulfilled' });
        const inventory = await BloodInventory.find({ status: 'Available' });
        const totalStock = inventory.reduce((acc, cur) => acc + cur.units, 0);

        reportData = [{
          generatedAt: new Date(),
          totalDonations: donations,
          totalRequests: requests,
          fulfilledRequests: fulfilled,
          fulfillmentRate: requests > 0 ? ((fulfilled / requests) * 100).toFixed(1) + '%' : '100%',
          totalAvailableStockUnits: totalStock
        }];
      }
    } else {
      if (type === 'donation') {
        reportData = memoryStore.donations;
      } else if (type === 'stock') {
        reportData = memoryStore.inventory;
      } else if (type === 'hospital') {
        reportData = memoryStore.requests;
      } else {
        const donations = memoryStore.donations.length;
        const requests = memoryStore.requests.length;
        const fulfilled = memoryStore.requests.filter(r => r.status === 'Fulfilled').length;
        const totalStock = memoryStore.inventory.reduce((acc, cur) => acc + (cur.units || 0), 0);

        reportData = [{
          generatedAt: new Date(),
          totalDonations: donations,
          totalRequests: requests,
          fulfilledRequests: fulfilled,
          fulfillmentRate: requests > 0 ? ((fulfilled / requests) * 100).toFixed(1) + '%' : '100%',
          totalAvailableStockUnits: totalStock
        }];
      }
    }

    res.json({
      reportType: type,
      generatedAt: new Date(),
      count: reportData.length,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
});

module.exports = router;
