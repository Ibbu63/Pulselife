const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const memoryStore = require('../memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const hospitals = await Hospital.find();
      return res.json(hospitals);
    } else {
      return res.json(memoryStore.hospitals);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hospitals' });
  }
});

module.exports = router;
