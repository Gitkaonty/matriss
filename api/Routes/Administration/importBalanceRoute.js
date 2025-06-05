const express = require('express');
const importBalanceController = require('../../Controllers/administration/importBalanceController');

const router = express.Router();

//création des comptes qui n'existent pas encore avant import journal
router.post('/createNotExistingCompte', importBalanceController.createNotExistingCompte);

//import de la balance
router.post('/importBalance', importBalanceController.importBalance);

module.exports = router;