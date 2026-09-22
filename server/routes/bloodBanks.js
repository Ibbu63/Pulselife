const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BloodBank = require('../models/BloodBank');
const memoryStore = require('../memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const bloodBanks = await BloodBank.find();
      return res.json(bloodBanks);
    } else {
      return res.json(memoryStore.bloodBanks);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blood banks' });
  }
});

module.exports = router;
