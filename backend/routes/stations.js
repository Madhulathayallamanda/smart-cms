const express = require('express');
const router = express.Router();
const PoliceStation = require('../models/PoliceStation');
const { auth, requireRole } = require('../middleware/auth');
const { findNearestStation } = require('../utils/distance');

// Get all stations
router.get('/', async (req, res) => {
  try {
    const stations = await PoliceStation.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, stations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Find nearest station
router.post('/nearest', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) return res.status(400).json({ success: false, message: 'Coordinates required' });

    const stations = await PoliceStation.find({ isActive: true });
    const nearest = findNearestStation(parseFloat(latitude), parseFloat(longitude), stations);
    if (!nearest) return res.status(404).json({ success: false, message: 'No stations found' });

    res.json({ success: true, station: nearest.station, distance: nearest.distance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single station
router.get('/:id', async (req, res) => {
  try {
    const station = await PoliceStation.findById(req.params.id);
    if (!station) return res.status(404).json({ success: false, message: 'Station not found' });
    res.json({ success: true, station });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Create station
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const station = await PoliceStation.create(req.body);
    res.status(201).json({ success: true, message: 'Station created', station });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update station
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const station = await PoliceStation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Station updated', station });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
