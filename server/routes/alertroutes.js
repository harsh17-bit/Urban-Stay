const express = require("express");
const router = express.Router();
const {
  createAlert,
  getMyAlerts,
  getAlert,
  updateAlert,
  deleteAlert,
  toggleAlertStatus,
  getMatchingProperties,
} = require("../controllers/alertcontroller");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

router.post("/", createAlert);
router.get("/", getMyAlerts);
router.get("/:id", getAlert);
router.put("/:id", updateAlert);
router.delete("/:id", deleteAlert);
router.put("/:id/toggle", toggleAlertStatus);
router.get("/:id/matches", getMatchingProperties);

module.exports = router;
