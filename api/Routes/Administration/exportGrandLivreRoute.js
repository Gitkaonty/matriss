const express = require('express');
const exportGrandLivreController = require('../../Controllers/administration/exportGrandLivreController');

const router = express.Router();

router.post('/pdf', exportGrandLivreController.exportPdf);
router.post('/excel', exportGrandLivreController.exportExcel);

module.exports = router;
