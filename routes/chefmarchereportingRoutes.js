const express = require('express');
const router = express.Router();
const controller = require('../controllers/chefmarchereportingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Route protégée : seul un chef de marché peut y accéder
router.get(
  '/monthly-report',
  authMiddleware,
  roleMiddleware('chefmarket'),
  controller.getMonthlyReportByCollector
);


router.get(
    '/collector-payments',
    authMiddleware,
    roleMiddleware('chefmarket'),
    controller.getCollectorPayments
  );

module.exports = router;
