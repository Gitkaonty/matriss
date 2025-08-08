const { fonctions: Fonction } = require('../../Models');

// Liste des fonctions
exports.getAll = async (req, res) => {
  try {
    const { id_compte, id_dossier } = req.params;
    const list = await Fonction.findAll({
      where: {
        id_compte: Number(id_compte),
        id_dossier: Number(id_dossier)
      }
    });
    return res.json({ state: true, list });
  } catch (error) {
    return res.json({ state: false, msg: 'Erreur lors de la récupération' });
  }
};

// Récupère une fonction par id
exports.getOne = async (req, res) => {
  try {
    const fonction = await Fonction.findByPk(req.params.id);
    if (!fonction) return res.status(404).json({ state: false, msg: 'Fonction non trouvée' });
    res.json({ state: true, data: fonction });
  } catch (error) {
    res.status(500).json({ state: false, msg: 'Erreur serveur', error });
  }
};

// Ajout d'une fonction
exports.create = async (req, res) => {
  try {
    const { nom, id_dossier, id_compte } = req.body;
    const fonction = await Fonction.create({ nom, id_dossier, id_compte });
    return res.json({ state: true, msg: 'Fonction ajoutée', data: fonction });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.json({ state: false, msg: 'Cette fonction existe déjà.' });
    }
    return res.json({ state: false, msg: 'Erreur lors de l\'ajout' });
  }
};

// Modification d'une fonction
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { nom } = req.body;
    const [nbUpdated] = await Fonction.update(
      { nom },
      { where: { id } }
    );
    if (nbUpdated) {
      return res.json({ state: true, msg: 'Fonction modifiée' });
    } else {
      return res.json({ state: false, msg: 'Aucune fonction trouvée à modifier' });
    }
  } catch (error) {
    return res.json({ state: false, msg: 'Erreur lors de la modification' });
  }
};

// Suppression d'une fonction
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const nbDeleted = await Fonction.destroy({ where: { id } });
    if (nbDeleted) {
      return res.json({ state: true, msg: 'Fonction supprimée' });
    } else {
      return res.json({ state: false, msg: 'Aucune fonction trouvée à supprimer' });
    }
  } catch (error) {
    console.error('Erreur suppression fonction:', error);
    return res.json({ state: false, msg: 'Erreur lors de la suppression', error: error.message });
  }
};