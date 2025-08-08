// Routes pour l'historique des exports IRSA
const express = require('express');
const router = express.Router();
const historiqueIrsaController = require('../Controllers/irsa/historiqueIrsaController');

// POST: créer un enregistrement d'export IRSA
router.post('/', historiqueIrsaController.createHistoriqueIrsa);

// GET: récupérer l'historique des exports IRSA (optionnel : filtrage par compte/dossier)
router.get('/', historiqueIrsaController.getHistoriqueIrsa);

module.exports = router;
