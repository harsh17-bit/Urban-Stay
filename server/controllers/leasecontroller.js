const Lease = require('../models/lease');
const Property = require('../models/property');
const User = require('../models/user');

// Create a lease (landlord creates or initiates)
exports.createLease = async (req, res) => {
  try {
    const {
      propertyId,
      tenantId,
      startDate,
      endDate,
      rentAmount,
      depositAmount,
      notes,
    } = req.body;

    const property = await Property.findById(propertyId);
    if (!property)
      return res
        .status(404)
        .json({ success: false, message: 'Property not found' });

    // Only property owner or admin can create lease
    if (
      property.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Not authorized to create lease for this property',
        });
    }

    const lease = await Lease.create({
      property: propertyId,
      landlord: req.user.id,
      tenant: tenantId,
      startDate,
      endDate,
      rentAmount,
      depositAmount,
      notes,
    });

    res.status(201).json({ success: true, lease });
  } catch (error) {
    console.error('Create lease error:', error);
    res.status(500).json({ success: false, message: 'Error creating lease' });
  }
};

// Get leases for current user (as landlord or tenant)
exports.getLeasesForUser = async (req, res) => {
  try {
    const filter = {
      $or: [{ landlord: req.user.id }, { tenant: req.user.id }],
    };
    const leases = await Lease.find(filter)
      .populate('property', 'title location price')
      .populate('landlord', 'name email')
      .populate('tenant', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: leases.length, leases });
  } catch (error) {
    console.error('Get leases error:', error);
    res.status(500).json({ success: false, message: 'Error fetching leases' });
  }
};

// Get single lease
exports.getLease = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate('property')
      .populate('landlord', 'name email')
      .populate('tenant', 'name email');

    if (!lease)
      return res
        .status(404)
        .json({ success: false, message: 'Lease not found' });

    // Only involved parties or admin can view
    if (
      lease.landlord._id.toString() !== req.user.id &&
      (!lease.tenant || lease.tenant._id.toString() !== req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to view lease' });
    }

    res.status(200).json({ success: true, lease });
  } catch (error) {
    console.error('Get lease error:', error);
    res.status(500).json({ success: false, message: 'Error fetching lease' });
  }
};

// Assign tenant (landlord or admin)
exports.assignTenant = async (req, res) => {
  try {
    const { tenantId } = req.body;
    const lease = await Lease.findById(req.params.id);
    if (!lease)
      return res
        .status(404)
        .json({ success: false, message: 'Lease not found' });

    const property = await Property.findById(lease.property);
    if (!property)
      return res
        .status(404)
        .json({ success: false, message: 'Property not found' });

    if (
      property.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to assign tenant' });
    }

    const tenant = await User.findById(tenantId);
    if (!tenant)
      return res
        .status(404)
        .json({ success: false, message: 'Tenant user not found' });

    lease.tenant = tenantId;
    lease.status = 'active';
    await lease.save();

    res.status(200).json({ success: true, lease });
  } catch (error) {
    console.error('Assign tenant error:', error);
    res.status(500).json({ success: false, message: 'Error assigning tenant' });
  }
};

// Update lease status (landlord or admin)
exports.updateLeaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const lease = await Lease.findById(req.params.id);
    if (!lease)
      return res
        .status(404)
        .json({ success: false, message: 'Lease not found' });

    const property = await Property.findById(lease.property);
    if (
      property.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Not authorized to update lease status',
        });
    }

    lease.status = status;
    await lease.save();

    res.status(200).json({ success: true, lease });
  } catch (error) {
    console.error('Update lease status error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error updating lease status' });
  }
};
