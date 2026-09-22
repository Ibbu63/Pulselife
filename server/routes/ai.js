const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const BloodInventory = require('../models/BloodInventory');
const memoryStore = require('../memoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const bloodCompatibilityMap = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};

router.get('/recommend-donors', async (req, res) => {
  try {
    const { bloodGroup } = req.query;
    if (!bloodGroup) return res.status(400).json({ message: 'Blood group is required' });

    const compatibleGroups = bloodCompatibilityMap[bloodGroup] || [bloodGroup];

    let donors;
    if (isDbConnected()) {
      donors = await User.find({ role: 'Donor', bloodGroup: { $in: compatibleGroups } }).select('-password').lean();
    } else {
      donors = memoryStore.users.filter(u => u.role === 'Donor' && compatibleGroups.includes(u.bloodGroup));
    }

    const scoredDonors = donors.map(d => ({
      ...d,
      isExactMatch: d.bloodGroup === bloodGroup,
      daysSinceDonation: 'Eligible Standby',
      suitabilityScore: (d.bloodGroup === bloodGroup ? 50 : 25) + 30
    }));

    res.json({
      targetBloodGroup: bloodGroup,
      compatibleGroups,
      totalRecommended: scoredDonors.length,
      donors: scoredDonors
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in smart donor recommendation', error: error.message });
  }
});

router.get('/predict-shortage', async (req, res) => {
  try {
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const stockByGroup = {};
    allGroups.forEach(g => { stockByGroup[g] = 0; });

    if (isDbConnected()) {
      const inventory = await BloodInventory.find({ status: 'Available' });
      inventory.forEach(item => {
        if (stockByGroup[item.bloodGroup] !== undefined) {
          stockByGroup[item.bloodGroup] += item.units;
        }
      });
    } else {
      memoryStore.inventory.forEach(item => {
        if (item.status === 'Available' && stockByGroup[item.bloodGroup] !== undefined) {
          stockByGroup[item.bloodGroup] += item.units;
        }
      });
    }

    const predictions = allGroups.map(group => {
      const currentStock = stockByGroup[group] || 0;
      let riskLevel = currentStock < 8 ? 'WARNING LOW STOCK' : 'Safe';
      let recommendation = currentStock < 8 ? `Schedule donor drive for ${group}.` : 'Stock level is adequate.';

      return {
        bloodGroup: group,
        currentStock,
        requestedUnits: 3,
        riskLevel,
        recommendation
      };
    });

    res.json({ generatedAt: new Date(), predictions });
  } catch (error) {
    res.status(500).json({ message: 'Error running shortage predictor', error: error.message });
  }
});

router.post('/chat', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: 'Please send a valid message.' });

  const query = message.toLowerCase();
  let reply = "PulseLife AI Assistant: I'm here to help with blood donation, eligibility, emergency requests, and blood bank services!";

  if (query.includes('eligible') || query.includes('can i donate') || query.includes('requirements')) {
    reply = "To donate blood, you must be between 18-65 years old, weigh at least 45kg (100 lbs), have a healthy hemoglobin level (>12.5 g/dL), and not have donated blood in the last 56 days (8 weeks).";
  } else if (query.includes('emergency') || query.includes('urgent') || query.includes('need blood')) {
    reply = "For emergency blood requests, navigate to the 'Find Blood / Request' section, set urgency to 'Emergency', and submit. Our system broadcasts instant alerts to all registered compatible donors and nearby blood banks!";
  } else if (query.includes('o-') || query.includes('universal')) {
    reply = "O-Negative is the Universal Red Blood Cell donor group because O- cells can be safely given to patients of any blood type! O+ is the most common blood group.";
  } else if (query.includes('how often') || query.includes('frequency') || query.includes('cooldown')) {
    reply = "Whole blood can be donated every 56 days (8 weeks). Platelet donation can be done every 7 days (up to 24 times per year).";
  }

  res.json({ reply });
});

module.exports = router;
