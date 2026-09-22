const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const BloodBank = require('../models/BloodBank');
const memoryStore = require('../memoryStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/', verifyToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const appts = await Appointment.find().populate('donorId').populate('bloodBankId');
      return res.json(appts);
    } else {
      return res.json(memoryStore.appointments);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

router.post('/', verifyToken, authorizeRoles('Donor', 'Admin'), async (req, res) => {
  try {
    let { bloodBankId, appointmentDate, timeSlot, notes } = req.body;

    if (isDbConnected()) {
      if (!bloodBankId || (typeof bloodBankId === 'string' && bloodBankId.startsWith('bb_'))) {
        const defaultBb = await BloodBank.findOne();
        bloodBankId = defaultBb ? defaultBb._id : null;
      }
      const newAppt = new Appointment({
        donorId: req.user.id,
        bloodBankId,
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        notes: notes || '',
        status: 'Scheduled'
      });
      await newAppt.save();
      const populated = await Appointment.findById(newAppt._id).populate('donorId').populate('bloodBankId');
      return res.status(201).json(populated);
    } else {
      const newAppt = {
        _id: 'apt_' + Date.now(),
        donorId: { _id: req.user.id, name: req.user.name || 'Donor' },
        bloodBankId: memoryStore.bloodBanks[0],
        appointmentDate: new Date(appointmentDate),
        timeSlot,
        status: 'Scheduled'
      };
      memoryStore.appointments.push(newAppt);
      return res.status(201).json(newAppt);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling appointment' });
  }
});

module.exports = router;
