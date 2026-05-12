const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const leaseController = require('../controllers/leasecontroller');

router.use(protect);

router.post('/', leaseController.createLease);
router.get('/', leaseController.getLeasesForUser);
router.get('/:id', leaseController.getLease);
router.put(
  '/:id/assign-tenant',
  authorize('seller', 'admin'),
  leaseController.assignTenant
);
router.put(
  '/:id/status',
  authorize('seller', 'admin'),
  leaseController.updateLeaseStatus
);

module.exports = router;
