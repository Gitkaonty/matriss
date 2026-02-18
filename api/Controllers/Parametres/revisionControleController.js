const { revisionControle } = require('../../Models');

// Récupérer tous les contrôles pour un compte/dossier/exercice
exports.getControles = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice } = req.params;
    
    const controles = await revisionControle.findAll({
      where: {
        id_compte,
        id_dossier,
        id_exercice
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      state: true,
      controles: controles
    });
  } catch (error) {
    console.error('Error fetching controles:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la récupération des contrôles'
    });
  }
};

// Ajouter ou mettre à jour un contrôle
exports.addOrUpdateControle = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice } = req.params;
    const {
      id_controle,
      Type,
      compte,
      test,
      description,
      anomalies,
      details,
      Valider,
      Commentaire,
      id_revision
    } = req.body;

    // Validation des données requises
    if (!id_controle || !Type || !compte || !test || !description) {
      return res.status(400).json({
        state: false,
        message: 'Les champs id_controle, Type, compte, test et description sont obligatoires'
      });
    }

    // Nettoyage et validation des données
    const cleanedData = {
      id_compte,
      id_dossier,
      id_exercice,
      id_controle: id_controle.toString().trim().substring(0, 255),
      Type: Type.toString().trim().substring(0, 255),
      compte: compte.toString().trim().substring(0, 255),
      test: test.toString().trim(),
      description: description.toString().trim(),
      anomalies: anomalies ? anomalies.toString().trim() : null,
      details: details ? details.toString().trim() : null,
      Valider: Boolean(Valider),
      Commentaire: Commentaire ? Commentaire.toString().trim() : null,
      id_revision: id_revision || null
    };

    console.log('Creating/updating controle with data:', cleanedData);

    const [controle, created] = await revisionControle.findOrCreate({
      where: {
        id_compte,
        id_dossier,
        id_exercice,
        id_controle: cleanedData.id_controle
      },
      defaults: cleanedData
    });

    if (!created) {
      // Mise à jour si le contrôle existe déjà
      await controle.update(cleanedData);
    }

    res.json({
      state: true,
      message: created ? 'Contrôle créé avec succès' : 'Contrôle mis à jour avec succès',
      controle: controle
    });
  } catch (error) {
    console.error('Error saving controle:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la sauvegarde du contrôle'
    });
  }
};

// Mettre à jour le statut de validation d'un contrôle
exports.updateValidation = async (req, res) => {
  try {
    const { id } = req.params;
    const { Valider, Commentaire } = req.body;

    const controle = await revisionControle.findByPk(id);
    if (!controle) {
      return res.status(404).json({
        state: false,
        message: 'Contrôle non trouvé'
      });
    }

    await controle.update({
      Valider: Boolean(Valider),
      Commentaire: Commentaire ? Commentaire.toString().trim() : controle.Commentaire
    });

    res.json({
      state: true,
      message: 'Validation mise à jour avec succès',
      controle: controle
    });
  } catch (error) {
    console.error('Error updating validation:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la mise à jour de la validation'
    });
  }
};

// Supprimer un contrôle
exports.deleteControle = async (req, res) => {
  try {
    const { id } = req.params;

    const controle = await revisionControle.findByPk(id);
    if (!controle) {
      return res.status(404).json({
        state: false,
        message: 'Contrôle non trouvé'
      });
    }

    await controle.destroy();

    res.json({
      state: true,
      message: 'Contrôle supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting controle:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la suppression du contrôle'
    });
  }
};

// Lier un contrôle à une révision
exports.linkToRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_revision } = req.body;

    const controle = await revisionControle.findByPk(id);
    if (!controle) {
      return res.status(404).json({
        state: false,
        message: 'Contrôle non trouvé'
      });
    }

    await controle.update({ id_revision });

    res.json({
      state: true,
      message: 'Contrôle lié à la révision avec succès',
      controle: controle
    });
  } catch (error) {
    console.error('Error linking to revision:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la liaison à la révision'
    });
  }
};
