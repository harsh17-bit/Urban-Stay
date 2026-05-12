const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const maintenanceController = require('../controllers/maintenancecontroller');

router.use(protect);

router.post('/', maintenanceController.createTicket);
router.get('/', maintenanceController.getTickets);
router.get('/:id', maintenanceController.getTicket);
router.put(
  '/:id/assign',
  authorize('seller', 'admin'),
  maintenanceController.assignVendor
);
router.post('/:id/comment', maintenanceController.addComment);
router.put('/:id/status', maintenanceController.updateStatus);

module.exports = router;
