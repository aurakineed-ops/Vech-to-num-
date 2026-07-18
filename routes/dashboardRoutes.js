const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

router.get('/dashboard', requireAuth, dashboardController.showDashboard);
router.get('/dashboard/live', requireAuth, dashboardController.liveStats);

module.exports = router;
