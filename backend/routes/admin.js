const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const PoliceStation = require('../models/PoliceStation');
const { auth, requireRole } = require('../middleware/auth');

// Admin dashboard
router.get('/dashboard', auth, requireRole('admin'), async (req, res) => {
  try {
    const [totalUsers, totalComplaints, totalStations, resolvedComplaints] = await Promise.all([
      User.countDocuments({ role: 'citizen' }),
      Complaint.countDocuments(),
      PoliceStation.countDocuments({ isActive: true }),
      Complaint.countDocuments({ status: 'Resolved' })
    ]);

    const stationStats = await PoliceStation.find({}, 'name activeComplaints resolvedComplaints').sort({ activeComplaints: -1 });

    res.json({ success: true, stats: { totalUsers, totalComplaints, totalStations, resolvedComplaints }, stationStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Manage users
router.get('/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).populate('assignedStation', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create police officer
router.post('/officers', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, badgeNumber, rank, assignedStation } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });
    const officer = await User.create({ name, email, password, phone, badgeNumber, rank, assignedStation, role: 'police' });
    res.status(201).json({ success: true, message: 'Officer created', officer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle user active
router.put('/users/:id/toggle', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
