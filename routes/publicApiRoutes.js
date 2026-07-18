/**
 * routes/publicApiRoutes.js
 * The public-facing Vehicle Info API surface (requires x-api-key).
 */
const express = require('express');
const router = express.Router();
const publicApiController = require('../controllers/publicApiController');
const apiKeyAuth = require('../middleware/apiKeyAuth');
const maintenanceGuard = require('../middleware/maintenanceMode');

// GET /api/v1/vehicle?vehicle=DL8CAF5030   (header: x-api-key)
router.get('/vehicle', maintenanceGuard, apiKeyAuth, publicApiController.fetchVehicle);

// Convenience alias: GET /api/v1/vehicle/DL8CAF5030
router.get('/vehicle/:number', maintenanceGuard, apiKeyAuth, publicApiController.fetchVehicle);

module.exports = router;
