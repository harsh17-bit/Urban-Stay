const Maintenance = require('../models/maintenance');
const Property = require('../models/property');
const Vendor = require('../models/vendor');

// Create a maintenance ticket (tenant or property manager)
exports.createTicket = async (req, res) => {
  try {
    const { propertyId, title, description, priority, images } = req.body;
    const property = await Property.findById(propertyId);
    if (!property)
      return res
        .status(404)
        .json({ success: false, message: 'Property not found' });

    const ticket = await Maintenance.create({
      property: propertyId,
      reportedBy: req.user.id,
      title,
      description,
      priority: priority || 'medium',
      images: images || [],
    });

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ success: false, message: 'Error creating ticket' });
  }
};

// Get tickets (filter by role and query)
exports.getTickets = async (req, res) => {
  try {
    const { propertyId, status } = req.query;
    const filter = {};
    if (propertyId) filter.property = propertyId;
    if (status) filter.status = status;

    // If user is a tenant, show tickets they reported
    if (req.user.role === 'user') {
      filter.reportedBy = req.user.id;
    }

    // If user is seller/landlord, show tickets for properties they own
    if (req.user.role === 'seller') {
      // find properties owned by seller - but minimal approach: allow any and filter later
      // keep simple: show tickets for properties where property.owner == req.user
      const properties = await Property.find({ owner: req.user.id }).select(
        '_id'
      );
      filter.property = { $in: properties.map((p) => p._id) };
    }

    const tickets = await Maintenance.find(filter)
      .populate('property', 'title location')
      .populate('reportedBy', 'name email')
      .populate('assignedVendor', 'name phone email')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ success: false, message: 'Error fetching tickets' });
  }
};

// Get single ticket
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Maintenance.findById(req.params.id)
      .populate('property')
      .populate('reportedBy', 'name email')
      .populate('assignedVendor', 'name phone email')
      .populate('comments.user', 'name email');

    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found' });

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ success: false, message: 'Error fetching ticket' });
  }
};

// Assign vendor (seller or admin)
exports.assignVendor = async (req, res) => {
  try {
    const { vendorId, scheduledAt, estimatedCost } = req.body;
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found' });

    // Only property owner or admin can assign
    const property = await Property.findById(ticket.property);
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
        .json({ success: false, message: 'Not authorized to assign vendor' });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor)
      return res
        .status(404)
        .json({ success: false, message: 'Vendor not found' });

    ticket.assignedVendor = vendorId;
    if (scheduledAt) ticket.scheduledAt = scheduledAt;
    if (estimatedCost) ticket.estimatedCost = estimatedCost;
    ticket.status = 'in_progress';
    await ticket.save();

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error('Assign vendor error:', error);
    res.status(500).json({ success: false, message: 'Error assigning vendor' });
  }
};

// Add comment to ticket (any user involved)
exports.addComment = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found' });

    ticket.comments.push({ user: req.user.id, message });
    await ticket.save();

    await ticket.populate('comments.user', 'name email');

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
};

// Update ticket status (vendor, seller, admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Maintenance.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found' });

    // Vendors can mark as resolved for assigned tickets
    if (req.user.role === 'seller') {
      const properties = await Property.find({ owner: req.user.id }).select(
        '_id'
      );
      const propIds = properties.map((p) => p._id.toString());
      if (
        !propIds.includes(ticket.property.toString()) &&
        req.user.role !== 'admin'
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message: 'Not authorized to update this ticket',
          });
      }
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Error updating ticket status' });
  }
};
