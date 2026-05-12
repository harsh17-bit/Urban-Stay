const mongoose = require('mongoose');

const leaseSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date },
    endDate: { type: Date },
    rentAmount: { type: Number, required: true },
    depositAmount: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'active', 'terminated', 'expired'],
      default: 'pending',
    },
    documents: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lease', leaseSchema);
