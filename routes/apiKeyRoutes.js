const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/apiKeyController');
const { requireAuth } = require('../middleware/auth');

router.get('/apikeys', requireAuth, apiKeyController.list);
router.get('/apikeys/json', requireAuth, apiKeyController.listJSON);
router.post('/apikeys', requireAuth, apiKeyController.create);
router.post('/apikeys/:id/update', requireAuth, apiKeyController.update);
router.post('/apikeys/:id/enable', requireAuth, apiKeyController.enable);
router.post('/apikeys/:id/disable', requireAuth, apiKeyController.disable);
router.post('/apikeys/:id/delete', requireAuth, apiKeyController.remove);
router.post('/apikeys/:id/reset', requireAuth, apiKeyController.resetUsage);
router.post('/apikeys/:id/extend', requireAuth, apiKeyController.extendExpiry);

module.exports = router;
