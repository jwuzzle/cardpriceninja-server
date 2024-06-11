const express = require('express');
const router = express.Router();
const ebayapiController = require('../controllers/ebay-api-controller');

router.get('/', ebayapiController.getExternalEbayListings);

module.exports = router;

