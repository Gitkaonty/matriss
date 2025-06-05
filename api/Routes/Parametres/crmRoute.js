const express = require('express');
const paramCRMController = require('../../Controllers/Parametres/paramCRMController');

const router = express.Router();

//récupérer la liste de dossiers associé l'user et à son compte
router.get('/infoscrm/:id', paramCRMController.getInfosCRM);

//Sauvegarde des mofifications
router.post('/modifying', paramCRMController.modifyingInfos);

//récupérer la liste des associés
router.get('/listeAssocie/:id', paramCRMController.getListeAssocie);

//récupérer la liste des filiales
router.get('/listeFiliale/:id', paramCRMController.getListeFiliale);

//récupérer la liste des domicialiations bancaires
router.get('/listeDomBank/:id', paramCRMController.getListeDomBank);

//Enregistrer un nouvel associe + sauvegarder les modifications sur un associe
router.post('/associe', paramCRMController.associe);

//Enregistrer une nouvelle filiales + sauvegarder les modifications sur une filiales
router.post('/filiale', paramCRMController.filiale);

//Enregistrer une nouvelle Dom bancaire + sauvegarder les modifications sur une dom bancaires
router.post('/domBank', paramCRMController.domBank);

//supprimer un associer 
router.post('/associeDelete', paramCRMController.deleteAssocie);

//supprimer une filiale
router.post('/filialeDelete', paramCRMController.deleteFiliale);

//supprimer une dom bancaire
router.post('/domBankDelete', paramCRMController.deleteDomBank);

//récupérer la liste des pays 
router.get('/getListePays', paramCRMController.getListePays);

module.exports = router;