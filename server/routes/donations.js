const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const memoryStore = require('../memoryStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/', verifyToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      let query = {};
      if (req.user.role === 'Donor') query.donorId = req.user.id;
      const donations = await Donation.find(query)
        .populate('donorId', 'name email phone bloodGroup age')
        .populate('bloodBankId', 'name address contact')
        .sort({ date: -1 });
      return res.json(donations);
    } else {
      let donations = [...memoryStore.donations];
      if (req.user.role === 'Donor') {
        donations = donations.filter(d => d.donorId?._id === req.user.id || d.donorId === req.user.id);
      }
      return res.json(donations);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donations', error: error.message });
  }
});

router.post('/', verifyToken, authorizeRoles('Donor', 'Admin'), async (req, res) => {
  try {
    const { bloodBankId, bloodGroup, units, remarks } = req.body;

    if (isDbConnected()) {
      const newDonation = new Donation({
        donorId: req.user.id,
        bloodBankId,
        bloodGroup,
        units: units || 1,
        testStatus: 'Pending',
        accepted: false,
        remarks: remarks || 'Scheduled for donation'
      });
      await newDonation.save();
      return res.status(201).json(newDonation);
    } else {
      const newDonation = {
        _id: 'don_' + Date.now(),
        donorId: { _id: req.user.id, name: req.user.name || 'Donor', email: req.user.email, bloodGroup: bloodGroup || 'A+' },
        bloodBankId: memoryStore.bloodBanks[0],
        bloodGroup: bloodGroup || 'A+',
        units: Number(units) || 1,
        date: new Date(),
        testStatus: 'Pending',
        accepted: false,
        remarks: remarks || 'Donation request'
      };
      memoryStore.donations.unshift(newDonation);
      return res.status(201).json(newDonation);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating donation request', error: error.message });
  }
});

router.put('/:id/accept', verifyToken, authorizeRoles('Blood Bank', 'Admin'), async (req, res) => {
  try {
    if (isDbConnected()) {
      const donation = await Donation.findByIdAndUpdate(req.params.id, { accepted: true }, { new: true });
      return res.json({ message: 'Donation accepted', donation });
    } else {
      const donation = memoryStore.donations.find(d => d._id === req.params.id);
      if (donation) donation.accepted = true;
      return res.json({ message: 'Donation accepted', donation });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error accepting donation' });
  }
});

router.put('/:id/test-status', verifyToken, authorizeRoles('Blood Bank', 'Admin'), async (req, res) => {
  try {
    const { testStatus } = req.body;

    if (isDbConnected()) {
      const donation = await Donation.findById(req.params.id);
      if (donation) {
        donation.testStatus = testStatus;
        await donation.save();
      }
      return res.json({ message: `Test status updated to ${testStatus}`, donation });
    } else {
      const donation = memoryStore.donations.find(d => d._id === req.params.id);
      if (donation) {
        donation.testStatus = testStatus;
        if (testStatus === 'Passed') {
          memoryStore.inventory.unshift({
            _id: 'inv_' + Date.now(),
            bloodGroup: donation.bloodGroup,
            units: donation.units,
            expiryDate: new Date(Date.now() + 86400000 * 35),
            bloodBankId: memoryStore.bloodBanks[0],
            status: 'Available'
          });
        }
      }
      return res.json({ message: `Test status updated to ${testStatus}`, donation });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating lab test status' });
  }
});

module.exports = router;
