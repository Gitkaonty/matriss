const { classifications } = require('../../../Models');

// Liste des classifications
exports.getAllClassifications = async (req, res) => {
  try {
    const list = await classifications.findAll();
    return res.json({ state: true, list });
  } catch (error) {
    return res.json({ state: false, msg: 'Erreur lors de la récupération' });
  }
};

// Récupère une classification par id
exports.getClassificationById = async (req, res) => {
  try {
    const classification = await classifications.findByPk(req.params.id);
    if (!classification) return res.status(404).json({ message: 'Classification non trouvée' });
    res.json(classification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Ajout d'une classification
exports.createClassification = async (req, res) => {
  try {
    const { classe, remarque, fileId, compteId, idClassification } = req.body;

    let resData = {
      state: false,
      msg: 'Une erreur est survenue au moment du traitement.',
    }

    if (!fileId || !compteId || !classe || !remarque || !idClassification) {
      return res.json({ state: false, msg: 'Champs obligatoires manquants' });
    }

    const id_compte = parseInt(compteId);
    const id_dossier = parseInt(fileId);
    const id = parseInt(idClassification);

    if (isNaN(id) || isNaN(id_compte) || isNaN(id_dossier)) {
      return res.status(400).json({
        state: false,
        message: "id_compte ou id_dossier invalide"
      });
    }

    const testIfExist = await classifications.findAll({
      where: {
        id,
        id_compte,
        id_dossier,
      }
    })

    if (testIfExist.length === 0) {
      const classificationAdded = await classifications.create({
        id_compte,
        id_dossier,
        classe,
        remarque
      })
      if (classificationAdded) {
        resData.state = true;
        resData.msg = "Nouvelle ligne sauvegardée avec succès.";
      } else {
        resData.state = false;
        resData.msg = "Une erreur est survenue au moment du traitement des données";
      }
    } else {
      const classificationUpdated = await classifications.update({
        classe,
        remarque
      }, {
        where: { id }
      });
      if (classificationUpdated) {
        resData.state = true;
        resData.msg = "Modification effectuée avec succès.";
      } else {
        resData.state = false;
        resData.msg = "Une erreur est survenue au moment du traitement des données";
      }
    }
    return res.json(resData);
  } catch (error) {
    console.error(error); // Pour voir l’erreur réelle dans la console
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.json({ state: false, msg: 'Cette classe existe déjà.' });
    }
    return res.json({ state: false, msg: 'Erreur lors de l\'ajout' });
  }
};

// Modification d'une classification
exports.updateClassification = async (req, res) => {
  try {
    const id = req.params.id;
    const { classe, remarque } = req.body;
    const [nbUpdated] = await classifications.update(
      { classe, remarque },
      { where: { id } }
    );
    if (nbUpdated) {
      return res.json({ state: true, msg: 'Classification modifiée' });
    } else {
      return res.json({ state: false, msg: 'Aucune classification trouvée à modifier' });
    }
  } catch (error) {
    return res.json({ state: false, msg: 'Erreur lors de la modification' });
  }
};

// Suppression d'une classification
exports.deleteClassification = async (req, res) => {
  try {
    const id = req.params.id;
    const nbDeleted = await classifications.destroy({ where: { id } });
    if (nbDeleted) {
      return res.json({ state: true, msg: 'Classification supprimée' });
    } else {
      return res.json({ state: false, msg: 'Aucune classification trouvée à supprimer' });
    }
  } catch (error) {
    return res.json({ state: false, msg: 'Erreur lors de la suppression' });
  }
};

exports.getClassificationsByDossier = async (req, res) => {
  const { id_compte, id_dossier } = req.params;
  try {
    const list = await classifications.findAll({ where: { id_dossier: id_dossier, id_compte: id_compte } });
    res.json({ state: true, list });
  } catch (e) {
    res.json({ state: false, list: [] });
  }
}; 