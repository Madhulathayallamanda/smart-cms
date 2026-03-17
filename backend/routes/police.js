const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const mongoose = require('mongoose');
const { auth, requireRole } = require('../middleware/auth');

// Get police dashboard stats
router.get('/dashboard', auth, requireRole('police', 'admin'), async (req, res) => {
  try {
    const stationFilter = req.user.role === 'police' ? { assignedStation: req.user.assignedStation } : {};
    const [total, submitted, accepted, underInvestigation, resolved, rejected] = await Promise.all([
      Complaint.countDocuments(stationFilter),
      Complaint.countDocuments({ ...stationFilter, status: 'Submitted' }),
      Complaint.countDocuments({ ...stationFilter, status: 'Accepted' }),
      Complaint.countDocuments({ ...stationFilter, status: 'Under Investigation' }),
      Complaint.countDocuments({ ...stationFilter, status: 'Resolved' }),
      Complaint.countDocuments({ ...stationFilter, status: 'Rejected' }),
    ]);
    const recentComplaints = await Complaint.find(stationFilter)
      .populate('citizen', 'name')
      .populate('assignedOfficer', 'name badgeNumber')
      .sort({ createdAt: -1 })
      .limit(5);
    const categoryBreakdown = await Complaint.aggregate([
      { $match: stationFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    // Unassigned complaints count
    const unassigned = await Complaint.countDocuments({
      ...stationFilter,
      assignedOfficer: { $exists: false },
      status: { $nin: ['Resolved', 'Rejected', 'Closed'] }
    });
    res.json({ success: true, stats: { total, submitted, accepted, underInvestigation, resolved, rejected, unassigned }, recentComplaints, categoryBreakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get officers in station with their workload
router.get('/officers', auth, requireRole('police', 'admin'), async (req, res) => {
  try {
    const stationId = req.query.stationId || req.user.assignedStation;
    const filter = { role: 'police' };
    if (req.user.role === 'police') filter.assignedStation = req.user.assignedStation;
    else if (stationId) filter.assignedStation = stationId;

    const officers = await User.find(filter)
      .populate('assignedStation', 'name stationCode')
      .select('-password');

    // Attach real-time case counts
    const officersWithCases = await Promise.all(officers.map(async (o) => {
      const activeCasesCount = await Complaint.countDocuments({
        assignedOfficer: o._id,
        status: { $nin: ['Resolved', 'Rejected', 'Closed'] }
      });
      const resolvedCasesCount = await Complaint.countDocuments({
        assignedOfficer: o._id,
        status: 'Resolved'
      });
      const obj = o.toObject();
      obj.activeCases = activeCasesCount;
      obj.resolvedCases = resolvedCasesCount;
      return obj;
    }));

    res.json({ success: true, officers: officersWithCases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get officer's assigned complaints
router.get('/my-cases', auth, requireRole('police'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { assignedOfficer: req.user._id };
    if (status) filter.status = status;
    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name phone')
      .populate('assignedStation', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, complaints, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update officer availability
router.put('/availability', auth, requireRole('police'), async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { isAvailable }, { new: true }).select('-password');
    res.json({ success: true, message: `Status set to ${isAvailable ? 'Available' : 'Unavailable'}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
