const express = require('express');
const router = express.Router();
const controleController = require('../../Controllers/Parametres/revisionControleController');
const verifyJWT = require('../../Middlewares/verifyJWT');
const verifyPermission = require('../../Middlewares/verifyPermission');

// Middleware d'authentification
router.use(verifyJWT);

// Routes pour les contrôles de révision
router.get('/:id_compte/:id_dossier/:id_exercice', controleController.getControles);
router.post('/', verifyJWT, verifyPermission('ADD', 'EDIT'), controleController.addOrUpdateControle);
router.put('/validation/:id', verifyJWT, verifyPermission('ADD', 'EDIT'), controleController.updateValidation);
router.delete('/:id', verifyJWT, controleController.deleteControle);
router.put('/link/:id', verifyJWT, verifyPermission('ADD', 'EDIT'), controleController.linkToRevision);

module.exports = router;