const db = require('../../Models');

// Récupérer toutes les matrices de contrôles
exports.getControleMatrices = async (req, res) => {
  try {
    // console.log('Fetching controle matrices...');
    const matrices = await db.revisionControleMatrix.findAll({
      order: [['id_controle', 'ASC']]
    });
    
    // console.log('Found matrices:', matrices.length);

    res.json({
      state: true,
      matrices: matrices
    });
  } catch (error) {
    console.error('Error fetching controle matrices:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la récupération des matrices de contrôles'
    });
  }
};

// Ajouter ou mettre à jour une matrice de contrôle
exports.addOrUpdateControleMatrix = async (req, res) => {
  try {
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
      paramUn
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
      id_controle: id_controle.toString().trim().substring(0, 255),
      Type: Type.toString().trim().substring(0, 255),
      compte: compte.toString().trim().substring(0, 255),
      test: test.toString().trim(),
      description: description.toString().trim(),
      anomalies: anomalies ? anomalies.toString().trim() : null,
      details: details ? details.toString().trim() : null,
      Valider: Boolean(Valider),
      Commentaire: Commentaire ? Commentaire.toString().trim() : null,
      paramUn: paramUn ? parseInt(paramUn) : null
    };

    // console.log('Creating/updating controle matrix with data:', cleanedData);

    const [matrix, created] = await db.revisionControleMatrix.findOrCreate({
      where: {
        id_controle: cleanedData.id_controle
      },
      defaults: cleanedData
    });

    if (!created) {
      // Mise à jour si la matrice existe déjà
      await matrix.update(cleanedData);
    }

    // Synchroniser paramUn vers les contrôles existants (table_revisions_controles)
    // Important: on met à jour toutes les lignes liées à l'id_controle, pour éviter les cas
    // où la lecture en exécution (réviser) voit encore paramUn=null.
    if (cleanedData.paramUn !== null && cleanedData.paramUn !== undefined) {
      const [updatedCount] = await db.revisionControle.update(
        { paramUn: cleanedData.paramUn },
        {
          where: {
            id_controle: cleanedData.id_controle
          }
        }
      );
      // console.log(
      //   `Synchronisé paramUn=${cleanedData.paramUn} pour id_controle=${cleanedData.id_controle} (lignes mises à jour: ${updatedCount})`
      // );
    }

    res.json({
      state: true,
      message: created ? 'Matrice de contrôle créée avec succès' : 'Matrice de contrôle mise à jour avec succès',
      matrix: matrix
    });
  } catch (error) {
    console.error('Error saving controle matrix:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la sauvegarde de la matrice de contrôle'
    });
  }
};

// Mettre à jour le statut de validation d'une matrice
exports.updateValidation = async (req, res) => {
  try {
    const { id } = req.params;
    const { Valider, Commentaire } = req.body;

    const matrix = await db.revisionControleMatrix.findByPk(id);
    if (!matrix) {
      return res.status(404).json({
        state: false,
        message: 'Matrice de contrôle non trouvée'
      });
    }

    await matrix.update({
      Valider: Boolean(Valider),
      Commentaire: Commentaire ? Commentaire.toString().trim() : matrix.Commentaire
    });

    res.json({
      state: true,
      message: 'Validation mise à jour avec succès',
      matrix: matrix
    });
  } catch (error) {
    console.error('Error updating validation:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la mise à jour de la validation'
    });
  }
};

// Supprimer une matrice de contrôle
exports.deleteControleMatrix = async (req, res) => {
  try {
    const { id } = req.params;

    const matrix = await db.revisionControleMatrix.findByPk(id);
    if (!matrix) {
      return res.status(404).json({
        state: false,
        message: 'Matrice de contrôle non trouvée'
      });
    }

    await matrix.destroy();

    res.json({
      state: true,
      message: 'Matrice de contrôle supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting controle matrix:', error);
    res.status(500).json({
      state: false,
      message: 'Erreur lors de la suppression de la matrice de contrôle'
    });
  }
};
