const db = require('../../Models');

// Sauvegarder ou mettre à jour une révision (statut et commentaire)
exports.saveRevision = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_periode, id_code, statut, commentaire } = req.body;

    // Validation
    if (!id_compte || !id_dossier || !id_exercice || !id_periode || !id_code) {
      return res.status(400).json({
        state: false,
        message: 'Les champs id_compte, id_dossier, id_exercice, id_periode et id_code sont obligatoires'
      });
    }

    // Validation du statut
    if (statut && !['OUI', 'NON', 'NA'].includes(statut)) {
      return res.status(400).json({
        state: false,
        message: 'Le statut doit être OUI, NON ou NA'
      });
    }

    // Rechercher si une entrée existe déjà
    const existing = await db.dossierRevision.findOne({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_periode,
        id_code
      }
    });

    let result;
    if (existing) {
      // Mise à jour
      await existing.update({
        statut: statut !== undefined ? statut : existing.statut,
        commentaire: commentaire !== undefined ? commentaire : existing.commentaire
      });
      result = existing;
    } else {
      // Création
      result = await db.dossierRevision.create({
        id_compte,
        id_dossier,
        id_exercice,
        id_periode,
        id_code,
        statut,
        commentaire
      });
    }

    return res.json({ state: true, revision: result });
  } catch (error) {
    console.error('Error in saveRevision:', error);
    return res.status(500).json({ state: false, message: error.message });
  }
};

// Récupérer les comptes associés (colonne compte_associe) pour un cycle et un contexte
exports.getCompteAssocieByCycle = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_periode, cycle } = req.params;

    const synthese = await db.dossierRevisionSynthese.findOne({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_periode,
        cycle: cycle.toUpperCase()
      }
    });

    return res.json({
      state: true,
      compte_associe: synthese?.compte_associe || null
    });
  } catch (error) {
    console.error('Error in getCompteAssocieByCycle:', error);
    return res.status(500).json({ state: false, message: error.message });
  }
};

// Sauvegarder les comptes associés (colonne compte_associe) pour un cycle et un contexte
exports.saveCompteAssocieByCycle = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_periode, cycle, compte_associe } = req.body;

    if (!id_compte || !id_dossier || !id_exercice || !id_periode || !cycle) {
      return res.status(400).json({
        state: false,
        message: 'Les champs id_compte, id_dossier, id_exercice, id_periode et cycle sont obligatoires'
      });
    }

    if (compte_associe !== null && compte_associe !== undefined && String(compte_associe).length > 1000) {
      return res.status(400).json({
        state: false,
        message: 'compte_associe est trop long (max 1000 caractères)'
      });
    }

    const [synthese] = await db.dossierRevisionSynthese.findOrCreate({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_periode,
        cycle: cycle.toUpperCase()
      },
      defaults: {
        id_code: null,
        progression: 0,
        points: 0,
        compte_associe: compte_associe ?? null
      }
    });

    await synthese.update({ compte_associe: compte_associe ?? null });

    return res.json({ state: true, compte_associe: synthese.compte_associe });
  } catch (error) {
    console.error('Error in saveCompteAssocieByCycle:', error);
    return res.status(500).json({ state: false, message: error.message });
  }
};

// Récupérer les révisions pour un contexte donné (dossier/exercice/période)
exports.getRevisionsByContext = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_periode } = req.params;

    const revisions = await db.dossierRevision.findAll({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_periode
      },
      order: [['id_code', 'ASC']]
    });

    return res.json({ state: true, revisions: revisions || [] });
  } catch (error) {
    console.error('Error in getRevisionsByContext:', error);
    return res.status(500).json({ state: false, message: error.message });
  }
};

// Sauvegarder uniquement le statut
exports.saveStatut = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_periode, id_code, statut } = req.body;

    if (!['OUI', 'NON', 'NA'].includes(statut)) {
      return res.status(400).json({
        state: false,
        message: 'Le statut doit être OUI, NON ou NA'
      });
    }

    const [revision, created] = await db.dossierRevision.findOrCreate({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_periode,
        id_code
      },
      defaults: {
        statut,
        commentaire: null
      }
    });

    if (!created) {
      await revision.update({ statut });
    }

    return res.json({ state: true, revision });
  } catch (error) {
    console.error('Error in saveStatut:', error);
    return res.status(500).json({ state: false, message: error.message });
  }
};

// Sauvegarder uniquement le commentaire
exports.saveCommentaire = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_periode, id_code, commentaire } = req.body;

    const [revision, created] = await db.dossierRevision.findOrCreate({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_periode,
        id_code
      },
      defaults: {
        statut: null,
        commentaire
      }
    });

    if (!created) {
      await revision.update({ commentaire });
    }

    return res.json({ state: true, revision });
  } catch (error) {
    console.error('Error in saveCommentaire:', error);
    return res.status(500).json({ state: false, message: error.message });
  }
};

// Récupérer les commentaires de synthèse par cycle et contexte
exports.getCommentairesSynthese = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_periode, cycle } = req.params;

    const commentaires = await db.dossierRevisionCommentaire.findAll({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_periode,
        cycle: cycle.toUpperCase()
      },
      order: [['createdAt', 'DESC']]
    });

    return res.json({ state: true, commentaires: commentaires || [] });
  } catch (error) {
    console.error('Error in getCommentairesSynthese:', error);
    return res.status(500).json({ state: false, message: error.message });
  }
};

// Sauvegarder un commentaire de synthèse
exports.saveCommentaireSynthese = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_periode, cycle, id_code, commentaire } = req.body;

    // Validation
    if (!id_compte || !id_dossier || !id_exercice || !id_periode || !cycle) {
      return res.status(400).json({
        state: false,
        message: 'Les champs id_compte, id_dossier, id_exercice, id_periode et cycle sont obligatoires'
      });
    }

    const result = await db.dossierRevisionCommentaire.create({
      id_compte,
      id_dossier,
      id_exercice,
      id_periode,
      cycle: cycle.toUpperCase(),
      id_code: id_code || null,
      commentaire
    });

    return res.json({ state: true, commentaire: result });
  } catch (error) {
    console.error('Error in saveCommentaireSynthese:', error);
    return res.status(500).json({ state: false, message: error.message });
  }
};

// Modifier un commentaire de synthèse
exports.updateCommentaireSynthese = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentaire } = req.body;

    if (!commentaire || !commentaire.trim()) {
      return res.status(400).json({
        state: false,
        message: 'Le commentaire est obligatoire'
      });
    }

    const existing = await db.dossierRevisionCommentaire.findByPk(id);
    if (!existing) {
      return res.status(404).json({
        state: false,
        message: 'Commentaire non trouvé'
      });
    }

    await existing.update({ commentaire });

    return res.json({ state: true, commentaire: existing });
  } catch (error) {
    console.error('Error in updateCommentaireSynthese:', error);
    return res.status(500).json({ state: false, message: error.message });
  }
};

// Supprimer un commentaire de synthèse
exports.deleteCommentaireSynthese = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.dossierRevisionCommentaire.findByPk(id);
    if (!existing) {
      return res.status(404).json({
        state: false,
        message: 'Commentaire non trouvé'
      });
    }

    await existing.destroy();

    return res.json({ state: true, message: 'Commentaire supprimé' });
  } catch (error) {
    console.error('Error in deleteCommentaireSynthese:', error);
    return res.status(500).json({ state: false, message: error.message });
  }
};

// Récupérer ou calculer la synthèse d'un cycle (progression et points de vigilance)
exports.getSyntheseByCycle = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice, id_periode, cycle } = req.params;

    // Récupérer les items (diligences) du cycle
    const cycleItems = await db.dossierRevisionMatrice.findAll({
      where: { cycle: cycle.toUpperCase() },
      order: [['code', 'ASC']]
    });

    if (!cycleItems || cycleItems.length === 0) {
      return res.json({
        state: true,
        synthese: {
          progression: 0,
          points: 0,
          total_items: 0
        }
      });
    }

    // Récupérer les révisions pour ce contexte
    const revisions = await db.dossierRevision.findAll({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_periode,
        id_code: cycleItems.map(item => String(item.code))
      }
    });

    // Transformer les révisions en objet indexé par id_code
    const revisionsByCode = {};
    revisions.forEach(r => {
      revisionsByCode[r.id_code] = r;
    });

    // Calculer la progression et les points de vigilance
    const totalItems = cycleItems.length;
    const completedItems = cycleItems.filter(item => {
      const status = revisionsByCode[String(item.code)]?.statut;
      return status === 'OUI' || status === 'NA';
    }).length;
    const progression = Math.round((completedItems / totalItems) * 100);

    const points = cycleItems.filter(item => {
      const status = revisionsByCode[String(item.code)]?.statut;
      return status === 'NON';
    }).length;

    // Sauvegarder ou mettre à jour la synthèse dans la table
    const [synthese, created] = await db.dossierRevisionSynthese.findOrCreate({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_periode,
        cycle: cycle.toUpperCase()
      },
      defaults: {
        id_code: cycleItems[0]?.id || null,
        progression,
        points,
        compte_associe: null
      }
    });

    if (!created) {
      await synthese.update({ progression, points });
    }

    return res.json({
      state: true,
      synthese: {
        progression,
        points,
        total_items: totalItems
      }
    });
  } catch (error) {
    console.error('Error in getSyntheseByCycle:', error);
    return res.status(500).json({ state: false, message: error.message });
  }
};
