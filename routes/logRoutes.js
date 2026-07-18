const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { requireAuth } = require('../middleware/auth');

router.get('/logs', requireAuth, logController.list);
router.get('/logs/export', requireAuth, logController.exportCSV);
router.post('/logs/:id/delete', requireAuth, logController.remove);
router.post('/logs/bulk-delete', requireAuth, logController.bulkDelete);
router.post('/logs/clear', requireAuth, logController.clearAll);

module.exports = router;
