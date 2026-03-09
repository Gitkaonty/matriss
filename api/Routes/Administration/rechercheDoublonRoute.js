const router = require('express').Router();
const rechercheDoublonController = require('../../Controllers/administration/rechercheDoublonController');

// POST - Lancer la recherche de doublons
router.post('/:id_compte/:id_dossier/:id_exercice', rechercheDoublonController.rechercherDoublons);

// GET - Récupérer les résultats existants
router.get('/:id_dossier/:id_exercice', rechercheDoublonController.getResultats);

// DELETE - Supprimer les résultats
router.delete('/:id_dossier/:id_exercice', rechercheDoublonController.supprimerResultats);

module.exports = router;
