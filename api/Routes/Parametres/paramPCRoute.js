const express = require('express');
const paramPCController = require('../../Controllers/Parametres/paramPCController');

const router = express.Router();

//récupérer le tableau du plan comptable
router.post('/pc', paramPCController.recupPc);
router.get('/PcIdLibelle/:id_compte/:id_dossier', paramPCController.recupPcIdLibelle)

//Afficher les détails du modèl sélectionné
router.post('/AddCpt', paramPCController.AddCptToPc);

//Récupérer la liste des comptes de charges et TVA associé à la ligne sélectionné du plan comptable du modèl
router.get('/keepListCptChgTvaAssoc/:itemId', paramPCController.keepListCptChgTvaAssoc);

//supprimer un compte dans le tableau du plan comptable
router.post('/deleteItemPc', paramPCController.deleteItemPc);


module.exports = router;