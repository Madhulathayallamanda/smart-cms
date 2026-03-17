const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedByName: { type: String },
  comment: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    default: () => 'CMP' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(-3).toUpperCase(),
    unique: true
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Theft', 'Assault', 'Fraud', 'Cybercrime', 'Accident', 'Missing Person', 'Domestic Violence', 'Drug Related', 'Property Damage', 'Public Nuisance', 'Corruption', 'Other']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Submitted', 'Accepted', 'Under Investigation', 'Resolved', 'Rejected', 'Closed'],
    default: 'Submitted'
  },
  // Citizen info
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  citizenName: { type: String },
  citizenPhone: { type: String },
  citizenEmail: { type: String },
  // Location info
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  locationAddress: { type: String },
  // Assigned station
  assignedStation: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' },
  stationName: { type: String },
  distanceToStation: { type: Number }, // in km
  // Assigned officer
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  officerName: { type: String },
  // Evidence
  evidence: [{
    filename: { type: String },
    originalName: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Status history
  statusHistory: [statusHistorySchema],
  // Investigation notes
  investigationNotes: { type: String },
  // Resolution
  resolution: { type: String },
  resolvedAt: { type: Date },
  // Anonymous flag
  isAnonymous: { type: Boolean, default: false },
}, { timestamps: true });

complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ status: 1 });
complaintSchema.index({ citizen: 1 });
complaintSchema.index({ assignedStation: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
