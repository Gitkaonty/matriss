const express = require('express');
const paramCodeJournauxController = require('../../Controllers/Parametres/paramCodeJournauxController');

const router = express.Router();

//récupérer la liste de dossiers associé l'user et à son compte
router.get('/listeCodeJournaux/:id', paramCodeJournauxController.getListeCodeJournaux);

//Ajout d'un code journal
router.post('/codeJournauxAdd', paramCodeJournauxController.addCodeJournal);

//supprimer un code journal
router.post('/codeJournauxDelete', paramCodeJournauxController.codeJournauxDelete);

module.exports = router;