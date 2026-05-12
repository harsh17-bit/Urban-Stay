const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const maintenanceSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    images: [{ type: String }],
    assignedVendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    vendorNotes: { type: String },
    estimatedCost: { type: Number },
    scheduledAt: { type: Date },
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
