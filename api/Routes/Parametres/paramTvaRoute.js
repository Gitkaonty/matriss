const express = require('express');
const paramTvaController = require('../../Controllers/Parametres/paramTvaController');

const router = express.Router();

//récupérer la liste de dossiers associé l'user et à son compte
router.get('/listeCodeTva', paramTvaController.getListeCodeTva);

//récupérer la liste des paramétrages de TVA effectués sur le dossier
router.get('/listeParamTva/:id', paramTvaController.listeParamTva);

//ajouter un paramétrage tva
router.post('/paramTvaAdd', paramTvaController.paramTvaAdd);

//supprimer un paramétrage tva
router.post('/paramTvaDelete', paramTvaController.paramTvaDelete);

// lister les écritures journal par compte comptable (id_numcpt)
router.get('/journals/byCompte', paramTvaController.listJournalsByCompte);



module.exports = router;