const mongoose = require('mongoose');

const policeStationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stationCode: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  inCharge: { type: String },
  totalOfficers: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  activeComplaints: { type: Number, default: 0 },
  resolvedComplaints: { type: Number, default: 0 },
  rating: { type: Number, default: 4.0 },
}, { timestamps: true });

policeStationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('PoliceStation', policeStationSchema);
