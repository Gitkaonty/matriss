const express = require('express');
const router = express.Router();
const registerController = require('../Controllers/registerController');

router.post('/',registerController.handleNewuser);

module.exports = router;