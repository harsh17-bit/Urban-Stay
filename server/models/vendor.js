const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    services: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
