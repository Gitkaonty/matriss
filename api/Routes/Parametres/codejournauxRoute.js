const express = require('express');
const paramCodeJournauxController = require('../../Controllers/Parametres/paramCodeJournauxController');

const verifyJWT = require('../../Middlewares/verifyJWT');
const verifyPermission = require('../../Middlewares/verifyPermission');

const router = express.Router();

//récupérer la liste de dossiers associé l'user et à son compte
router.get('/listeCodeJournaux/:id', paramCodeJournauxController.getListeCodeJournaux);

//Ajout d'un code journal
router.post('/codeJournauxAdd', verifyJWT, verifyPermission('ADD', 'EDIT'), paramCodeJournauxController.addCodeJournal);

//supprimer un code journal
router.post('/codeJournauxDelete', verifyJWT, verifyPermission('DELETE'), paramCodeJournauxController.codeJournauxDelete);

module.exports = router;