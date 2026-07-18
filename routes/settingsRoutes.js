const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authController = require('../controllers/authController');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

router.get('/settings', requireAuth, settingsController.show);
router.post('/settings', requireAuth, requireSuperAdmin, settingsController.update);
router.post('/settings/change-password', requireAuth, authController.changePassword);
router.post('/settings/admins', requireAuth, requireSuperAdmin, settingsController.createAdmin);
router.post('/settings/admins/:id/delete', requireAuth, requireSuperAdmin, settingsController.deleteAdmin);

module.exports = router;
