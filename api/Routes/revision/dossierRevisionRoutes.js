const express = require('express');
const router = express.Router();
const dossierRevisionController = require('../../Controllers/revision/dossierRevisionController');
const verifyJWT = require('../../Middlewares/verifyJWT');

// Sauvegarder une révision complète (statut + commentaire)
router.post('/', verifyJWT, dossierRevisionController.saveRevision);

// Sauvegarder uniquement le statut
router.post('/statut', verifyJWT, dossierRevisionController.saveStatut);

// Sauvegarder uniquement le commentaire
router.post('/commentaire', verifyJWT, dossierRevisionController.saveCommentaire);

// Récupérer les révisions pour un contexte
router.get('/:id_compte/:id_dossier/:id_exercice/:id_periode', verifyJWT, dossierRevisionController.getRevisionsByContext);

// Récupérer les commentaires de synthèse par cycle
router.get('/commentaires/:id_compte/:id_dossier/:id_exercice/:id_periode/:cycle', verifyJWT, dossierRevisionController.getCommentairesSynthese);

// Sauvegarder un commentaire de synthèse
router.post('/commentaires', verifyJWT, dossierRevisionController.saveCommentaireSynthese);

// Modifier un commentaire de synthèse
router.put('/commentaires/:id', verifyJWT, dossierRevisionController.updateCommentaireSynthese);

// Supprimer un commentaire de synthèse
router.delete('/commentaires/:id', verifyJWT, dossierRevisionController.deleteCommentaireSynthese);

// Récupérer la synthèse d'un cycle (progression et points de vigilance)
router.get('/synthese/:id_compte/:id_dossier/:id_exercice/:id_periode/:cycle', verifyJWT, dossierRevisionController.getSyntheseByCycle);

// Récupérer les comptes associés d'un cycle
router.get('/compte-associe/:id_compte/:id_dossier/:id_exercice/:id_periode/:cycle', verifyJWT, dossierRevisionController.getCompteAssocieByCycle);

// Sauvegarder les comptes associés d'un cycle
router.post('/compte-associe', verifyJWT, dossierRevisionController.saveCompteAssocieByCycle);

module.exports = router;