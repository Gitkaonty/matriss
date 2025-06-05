const express = require('express');
const importJournalController = require('../../Controllers/administration/importJournalController');

const router = express.Router();

//création des codes journaux qui n'existent pas encore avant import journal
router.post('/createNotExistingCodeJournal', importJournalController.createNotExistingCodeJournal);

//création des comptes qui n'existent pas encore avant import journal
router.post('/createNotExistingCompte', importJournalController.createNotExistingCompte);

//import du journal excel csv ou FEC
router.post('/importJournal', importJournalController.importJournal);

module.exports = router;