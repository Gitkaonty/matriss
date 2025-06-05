const express = require('express');
const exportBalanceController = require('../../Controllers/administration/exportBalanceController');

const router = express.Router();

//création des comptes qui n'existent pas encore avant import journal
router.post('/recupBalance', exportBalanceController.recupBalance);

module.exports = router;