const express = require('express');
const router = express.Router();
const controleMatrixController = require('../../Controllers/Parametres/revisionControleMatrixController');
const verifyJWT = require('../../Middlewares/verifyJWT');
const verifyPermission = require('../../Middlewares/verifyPermission');

// Middleware d'authentification
router.use(verifyJWT);

// Routes pour les matrices de contrôles de révision
router.get('/', controleMatrixController.getControleMatrices);
router.post('/', verifyJWT, verifyPermission('ADD', 'EDIT'), controleMatrixController.addOrUpdateControleMatrix);
router.put('/validation/:id', verifyJWT, verifyPermission('ADD', 'EDIT'), controleMatrixController.updateValidation);
router.delete('/:id', verifyJWT, controleMatrixController.deleteControleMatrix);

module.exports = router;
