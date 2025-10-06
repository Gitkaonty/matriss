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
    console.log(req.body);
    const { classe, remarque, id_dossier, id_compte } = req.body;
    const classification = await classifications.create({ classe, remarque, id_dossier, id_compte });
    return res.json({ state: true, msg: 'Classification ajoutée', data: classification });
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