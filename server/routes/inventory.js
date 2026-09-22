const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const BloodInventory = require('../models/BloodInventory');
const memoryStore = require('../memoryStore');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const isDbConnected = () => mongoose.connection.readyState === 1;

router.get('/', async (req, res) => {
  try {
    const { bloodGroup, status, city } = req.query;

    if (isDbConnected()) {
      let query = {};
      if (bloodGroup) query.bloodGroup = bloodGroup;
      if (status) query.status = status;
      let items = await BloodInventory.find(query).populate('bloodBankId');
      if (city) {
        items = items.filter(item => item.bloodBankId && item.bloodBankId.address.toLowerCase().includes(city.toLowerCase()));
      }
      return res.json(items);
    } else {
      let items = [...memoryStore.inventory];
      if (bloodGroup) items = items.filter(i => i.bloodGroup === bloodGroup);
      if (status) items = items.filter(i => i.status === status);
      if (city) items = items.filter(i => i.bloodBankId?.address?.toLowerCase().includes(city.toLowerCase()));
      return res.json(items);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
});

router.post('/', verifyToken, authorizeRoles('Blood Bank', 'Admin'), async (req, res) => {
  try {
    const { bloodGroup, units, expiryDate, bloodBankId } = req.body;

    if (isDbConnected()) {
      const newItem = new BloodInventory({
        bloodGroup, units: Number(units), expiryDate: new Date(expiryDate), bloodBankId: bloodBankId || memoryStore.bloodBanks[0]._id, status: 'Available'
      });
      await newItem.save();
      return res.status(201).json(newItem);
    } else {
      const newItem = {
        _id: 'inv_' + Date.now(),
        bloodGroup,
        units: Number(units),
        expiryDate: new Date(expiryDate),
        bloodBankId: memoryStore.bloodBanks[0],
        status: 'Available'
      };
      memoryStore.inventory.push(newItem);
      return res.status(201).json(newItem);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding blood units', error: error.message });
  }
});

router.delete('/expired', verifyToken, authorizeRoles('Blood Bank', 'Admin'), async (req, res) => {
  try {
    if (isDbConnected()) {
      const result = await BloodInventory.deleteMany({ status: 'Expired' });
      return res.json({ message: `Successfully removed ${result.deletedCount} expired blood units.` });
    } else {
      const before = memoryStore.inventory.length;
      memoryStore.inventory = memoryStore.inventory.filter(i => i.status !== 'Expired');
      const removed = before - memoryStore.inventory.length;
      return res.json({ message: `Successfully removed ${removed} expired blood units.` });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error removing expired blood' });
  }
});

module.exports = router;
