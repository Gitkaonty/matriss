const express = require('express');
const exportBalanceController = require('../../Controllers/administration/exportBalanceController');

const router = express.Router();

//création des comptes qui n'existent pas encore avant import journal
router.post('/recupBalance', exportBalanceController.recupBalance);

// export PDF/Excel balance
router.post('/pdf', exportBalanceController.exportPdf);
router.post('/excel', exportBalanceController.exportExcel);

module.exports = router;