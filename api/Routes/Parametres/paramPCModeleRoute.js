const express = require('express');
const paramPCModeleController = require('../../Controllers/Parametres/paramPCModeleController');

const verifyJWT = require('../../Middlewares/verifyJWT');
const verifyPermission = require('../../Middlewares/verifyPermission');

const router = express.Router();

//récupération de la liste des modèles dans le compte
router.post('/model', paramPCModeleController.recupListModelePlanComptable);

// router.get('/model', paramPCModeleController.recupListModelePlanComptable );

//récupérer la liste de dossiers associé l'user et à son compte
router.post('/dossier', paramPCModeleController.recupListDossier);

//créer un modèl
router.post('/createModel', verifyJWT, verifyPermission('ADD'), paramPCModeleController.createModel);

//Supprimer un modèl
router.post('/deleteModel', verifyJWT, verifyPermission('DELETE'), paramPCModeleController.deleteModel);

//Afficher les détails du modèl sélectionné
router.post('/detailModel', paramPCModeleController.detailModel);

//Ajouter un compte dans la liste plan comptable du modèle
router.post('/AddCptTodetailModel', verifyJWT, verifyPermission('ADD', 'EDIT'), paramPCModeleController.AddCptTodetailModel);

//Récupérer la liste des comptes de charges et TVA associé à la ligne sélectionné du plan comptable du modèl
router.get('/keepListCptChgTvaAssoc/:itemId', paramPCModeleController.keepListCptChgTvaAssoc);

//supprimer un compte dans le tableau du plan comptable
router.post('/deleteItemPc', verifyJWT, verifyPermission('DELETE'), paramPCModeleController.deleteItemPc);


module.exports = router;