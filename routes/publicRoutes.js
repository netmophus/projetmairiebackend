const express = require('express');
const router = express.Router();
const { verifyReceiptByCode } = require('../controllers/publicController');

router.get('/verify-receipt', verifyReceiptByCode);

module.exports = router;
