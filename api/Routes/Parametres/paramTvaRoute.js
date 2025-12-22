const express = require('express');
const paramTvaController = require('../../Controllers/Parametres/paramTvaController');

const verifyJWT = require('../../Middlewares/verifyJWT');
const verifyPermission = require('../../Middlewares/verifyPermission');

const router = express.Router();

//récupérer la liste de dossiers associé l'user et à son compte
router.get('/listeCodeTva', paramTvaController.getListeCodeTva);

//récupérer la liste des paramétrages de TVA effectués sur le dossier
router.get('/listeParamTva/:id', paramTvaController.listeParamTva);

//ajouter un paramétrage tva
router.post('/paramTvaAdd', verifyJWT, verifyPermission('ADD', 'EDIT'), paramTvaController.paramTvaAdd);

//supprimer un paramétrage tva
router.post('/paramTvaDelete', verifyJWT, verifyPermission('DELETE'), paramTvaController.paramTvaDelete);

// lister les écritures journal par compte comptable (id_numcpt)
router.get('/journals/byCompte', paramTvaController.listJournalsByCompte);



module.exports = router;