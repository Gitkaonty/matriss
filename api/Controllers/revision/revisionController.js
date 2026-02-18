const db = require('../../Models');
const { Op } = require('sequelize');

// Créer ou mettre à jour une révision
exports.addOrUpdateRevision = async (req, res) => {
  try {
    console.log('addOrUpdateRevision - req.body:', req.body);
    const { id_compte, id_dossier, id_exercice, Type, Description, NbrAnomalies, Status, Commentaire } = req.body;
    
    // Validation et nettoyage des données
    if (!Type || !Description) {
      return res.status(400).json({ 
        state: false, 
        message: 'Type et Description sont obligatoires' 
      });
    }

    // Limiter la longueur des champs text pour éviter les erreurs de base de données
    const cleanedType = Type.toString().trim().substring(0, 255);
    const cleanedDescription = Description.toString().trim().substring(0, 10000);
    const cleanedCommentaire = Commentaire ? Commentaire.toString().trim().substring(0, 10000) : null;
    
    const [rev, created] = await db.revision.findOrCreate({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        Type: cleanedType,
        Description: cleanedDescription
      },
      defaults: {
        NbrAnomalies: NbrAnomalies || 0,
        Status: Status || false,
        Commentaire: cleanedCommentaire
      }
    });

    console.log('findOrCreate result - created:', created, 'rev:', rev?.toJSON());

    if (!created) {
      await rev.update({
        NbrAnomalies: NbrAnomalies || rev.NbrAnomalies,
        Status: Status !== undefined ? Status : rev.Status,
        Commentaire: cleanedCommentaire !== undefined ? cleanedCommentaire : rev.Commentaire
      });
    }

    res.json({ state: true, revision: rev });
  } catch (error) {
    console.error('Error in addOrUpdateRevision:', error);
    res.status(500).json({ state: false, message: error.message });
  }
};

// Récupérer toutes les révisions pour un compte/dossier/exercice
exports.getRevisions = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice } = req.params;
    console.log('getRevisions - params:', { id_compte, id_dossier, id_exercice });
    
    const revisions = await db.revision.findAll({
      where: {
        id_compte,
        id_dossier,
        id_exercice
      },
      order: [['createdAt', 'DESC']]
    });

    console.log('getRevisions - found:', revisions.length, 'revisions');
    res.json({ state: true, revisions });
  } catch (error) {
    console.error('Error in getRevisions:', error);
    res.status(500).json({ state: false, message: error.message });
  }
};

// Mettre à jour le statut d'une révision
exports.updateRevisionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { Status, Commentaire } = req.body;
    
    const rev = await db.revision.findByPk(id);
    if (!rev) {
      return res.status(404).json({ state: false, message: 'Revision not found' });
    }

    await rev.update({
      Status: Status !== undefined ? Status : rev.Status,
      Commentaire: Commentaire !== undefined ? Commentaire : rev.Commentaire
    });

    res.json({ state: true, revision: rev });
  } catch (error) {
    console.error('Error in updateRevisionStatus:', error);
    res.status(500).json({ state: false, message: error.message });
  }
};

// Supprimer une révision
exports.deleteRevision = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rev = await db.revision.findByPk(id);
    if (!rev) {
      return res.status(404).json({ state: false, message: 'Revision not found' });
    }

    await rev.destroy();
    res.json({ state: true, message: 'Revision deleted successfully' });
  } catch (error) {
    console.error('Error in deleteRevision:', error);
    res.status(500).json({ state: false, message: error.message });
  }
};
