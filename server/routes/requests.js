const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BloodRequest = require('../models/BloodRequest');
const memoryStore = require('../memoryStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const requests = await BloodRequest.find()
        .populate('hospitalId')
        .populate('assignedBloodBankId')
        .sort({ requestedDate: -1 });
      return res.json(requests);
    } else {
      return res.json(memoryStore.requests);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blood requests', error: error.message });
  }
});

router.post('/', verifyToken, authorizeRoles('Hospital', 'Admin'), async (req, res) => {
  try {
    const { bloodGroup, units, urgency, reason } = req.body;

    if (isDbConnected()) {
      const newRequest = new BloodRequest({
        hospitalId: req.user.id,
        bloodGroup,
        units: Number(units),
        urgency: urgency || 'Normal',
        reason,
        status: 'Pending'
      });
      await newRequest.save();
      return res.status(201).json(newRequest);
    } else {
      const newRequest = {
        _id: 'req_' + Date.now(),
        hospitalId: memoryStore.hospitals[0],
        bloodGroup,
        units: Number(units),
        urgency: urgency || 'Normal',
        reason,
        status: 'Pending',
        requestedDate: new Date()
      };
      memoryStore.requests.unshift(newRequest);
      return res.status(201).json(newRequest);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating blood request', error: error.message });
  }
});

router.put('/:id/status', verifyToken, authorizeRoles('Blood Bank', 'Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (isDbConnected()) {
      const request = await BloodRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
      return res.json({ message: `Request status updated to ${status}`, request });
    } else {
      const request = memoryStore.requests.find(r => r._id === req.params.id);
      if (request) request.status = status;
      return res.json({ message: `Request status updated to ${status}`, request });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating request status' });
  }
});

module.exports = router;
