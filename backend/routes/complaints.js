const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const PoliceStation = require('../models/PoliceStation');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { findNearestStation } = require('../utils/distance');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/evidence';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Submit new complaint
router.post('/', auth, requireRole('citizen'), upload.array('evidence', 5), async (req, res) => {
  try {
    const { title, description, category, priority, latitude, longitude, locationAddress, isAnonymous } = req.body;
    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const stations = await PoliceStation.find({ isActive: true });
    if (!stations.length) return res.status(500).json({ success: false, message: 'No active police stations found' });
    const nearest = findNearestStation(lat, lon, stations);
    if (!nearest) return res.status(500).json({ success: false, message: 'Could not determine nearest station' });
    const evidence = req.files?.map(f => ({ filename: f.filename, originalName: f.originalname, mimetype: f.mimetype, size: f.size })) || [];
    const citizen = await User.findById(req.user._id);
    const complaint = await Complaint.create({
      title, description, category,
      priority: priority || 'Medium',
      location: { type: 'Point', coordinates: [lon, lat] },
      locationAddress,
      citizen: req.user._id,
      citizenName: isAnonymous === 'true' ? 'Anonymous' : citizen.name,
      citizenPhone: isAnonymous === 'true' ? null : citizen.phone,
      citizenEmail: isAnonymous === 'true' ? null : citizen.email,
      assignedStation: nearest.station._id,
      stationName: nearest.station.name,
      distanceToStation: nearest.distance,
      evidence,
      isAnonymous: isAnonymous === 'true',
      statusHistory: [{ status: 'Submitted', updatedByName: 'System', comment: `Auto-assigned to ${nearest.station.name} (${nearest.distance} km away)` }]
    });
    await PoliceStation.findByIdAndUpdate(nearest.station._id, { $inc: { activeComplaints: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { complaintsSubmitted: 1 } });
    const populated = await Complaint.findById(complaint._id).populate('assignedStation', 'name address phone city');
    res.status(201).json({ success: true, message: 'Complaint submitted successfully', complaint: populated, nearestStation: nearest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get citizen's complaints
router.get('/my', auth, requireRole('citizen'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { citizen: req.user._id };
    if (status) filter.status = status;
    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('assignedStation', 'name address phone city')
      .populate('assignedOfficer', 'name badgeNumber rank')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, complaints, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stats — must come before /:id
router.get('/stats/summary', auth, async (req, res) => {
  try {
    let matchFilter = {};
    if (req.user.role === 'citizen') matchFilter.citizen = req.user._id;
    else if (req.user.role === 'police') {
      const stationId = req.user.assignedStation;
      if (stationId) matchFilter.assignedStation = stationId;
    }
    const stats = await Complaint.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const categoryStats = await Complaint.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const result = { total: 0, byStatus: {}, byCategory: categoryStats };
    stats.forEach(s => { result.byStatus[s._id] = s.count; result.total += s.count; });
    res.json({ success: true, stats: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Station assigned — must come before /:id
router.get('/station/assigned', auth, requireRole('police', 'admin'), async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10, officerId } = req.query;
    const filter = {};
    if (req.user.role === 'police') filter.assignedStation = req.user.assignedStation;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (officerId) filter.assignedOfficer = officerId;
    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name phone email')
      .populate('assignedStation', 'name')
      .populate('assignedOfficer', 'name badgeNumber rank')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, complaints, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { complaintId: req.params.id }].filter(Boolean)
    })
      .populate('assignedStation', 'name address phone city location')
      .populate('assignedOfficer', 'name badgeNumber rank phone isAvailable activeCases specialization')
      .populate('citizen', 'name phone email');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (req.user.role === 'citizen' && complaint.citizen._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Police: Update complaint status
router.put('/:id/status', auth, requireRole('police', 'admin'), async (req, res) => {
  try {
    const { status, comment, investigationNotes, resolution } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    const updateData = {
      status,
      $push: { statusHistory: { status, updatedBy: req.user._id, updatedByName: req.user.name, comment, timestamp: new Date() } }
    };
    if (investigationNotes) updateData.investigationNotes = investigationNotes;
    if (resolution) updateData.resolution = resolution;
    if (status === 'Resolved') {
      updateData.resolvedAt = new Date();
      await PoliceStation.findByIdAndUpdate(complaint.assignedStation, { $inc: { activeComplaints: -1, resolvedComplaints: 1 } });
      await User.findByIdAndUpdate(complaint.citizen, { $inc: { complaintsResolved: 1 } });
      // Reduce officer active cases
      if (complaint.assignedOfficer) {
        await User.findByIdAndUpdate(complaint.assignedOfficer, { $inc: { activeCases: -1 } });
      }
    }
    const updated = await Complaint.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('assignedStation', 'name address city')
      .populate('assignedOfficer', 'name badgeNumber rank')
      .populate('citizen', 'name phone');
    res.json({ success: true, message: 'Status updated', complaint: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Police/Admin: Assign officer to complaint
router.put('/:id/assign-officer', auth, requireRole('police', 'admin'), async (req, res) => {
  try {
    const { officerId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    // Un-assign previous officer if any
    if (complaint.assignedOfficer && complaint.assignedOfficer.toString() !== officerId) {
      await User.findByIdAndUpdate(complaint.assignedOfficer, { $inc: { activeCases: -1 } });
    }

    const officer = await User.findById(officerId);
    if (!officer) return res.status(404).json({ success: false, message: 'Officer not found' });

    // Assign new officer
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assignedOfficer: officerId,
        officerName: officer.name,
        status: complaint.status === 'Submitted' ? 'Accepted' : complaint.status,
        $push: {
          statusHistory: {
            status: complaint.status === 'Submitted' ? 'Accepted' : complaint.status,
            updatedBy: req.user._id,
            updatedByName: req.user.name,
            comment: `Case assigned to Officer ${officer.name} (Badge: ${officer.badgeNumber || 'N/A'})`,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    ).populate('assignedOfficer', 'name badgeNumber rank phone isAvailable activeCases')
     .populate('assignedStation', 'name address city')
     .populate('citizen', 'name phone');

    // Increment officer's active cases (only if not already assigned)
    if (!complaint.assignedOfficer || complaint.assignedOfficer.toString() !== officerId) {
      await User.findByIdAndUpdate(officerId, { $inc: { activeCases: 1, totalAssigned: 1 } });
    }

    res.json({ success: true, message: `Case assigned to ${officer.name}`, complaint: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Police/Admin: Unassign officer from complaint
router.put('/:id/unassign-officer', auth, requireRole('police', 'admin'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.assignedOfficer) {
      await User.findByIdAndUpdate(complaint.assignedOfficer, { $inc: { activeCases: -1 } });
    }
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        $unset: { assignedOfficer: 1, officerName: 1 },
        status: 'Submitted',
        $push: { statusHistory: { status: 'Submitted', updatedBy: req.user._id, updatedByName: req.user.name, comment: 'Officer unassigned — case returned to queue', timestamp: new Date() } }
      },
      { new: true }
    );
    res.json({ success: true, message: 'Officer unassigned', complaint: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
