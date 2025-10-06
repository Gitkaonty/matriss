// Routes unifiées pour l'historique des déclarations (IRSA/TVA)
const express = require('express');
const router = express.Router();
const ctrl = require('../../Controllers/Declaration/historiquesDeclarationController');

// Créer un enregistrement d'historique
router.post('/', ctrl.createHistorique);

// Récupérer l'historique (filtrable par idCompte, idDossier, declaration)
router.get('/', ctrl.getHistoriques);

module.exports = router;
