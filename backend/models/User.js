const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'police', 'admin'], default: 'citizen' },
  avatar: { type: String, default: null },
  address: { type: String },
  isActive: { type: Boolean, default: true },
  // Police specific fields
  badgeNumber: { type: String },
  rank: { type: String },
  assignedStation: { type: mongoose.Schema.Types.ObjectId, ref: 'PoliceStation' },
  // Officer availability & workload
  isAvailable: { type: Boolean, default: true },
  activeCases: { type: Number, default: 0 },
  specialization: { type: String, default: 'General' },
  // Stats
  complaintsSubmitted: { type: Number, default: 0 },
  complaintsResolved: { type: Number, default: 0 },
  totalAssigned: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
