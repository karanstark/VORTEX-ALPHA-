const express = require('express');
const router = express.Router();
const bfhlController = require('../controllers/bfhlController');

router.post('/', bfhlController.processHierarchies);

module.exports = router;
