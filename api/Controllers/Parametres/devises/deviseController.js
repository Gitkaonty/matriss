const { Devise } = require('../../../Models');

// Liste toutes les devises
exports.getAllDevises = async (req, res) => {
  try {
    const { id_compte, id_dossier } = req.params;
    const devises = await Devise.findAll({ where: { id_compte: id_compte, id_dossier: id_dossier } });
    res.json(devises);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

// Récupère une devise par id
exports.getDeviseById = async (req, res) => {
  try {
    const devise = await Devise.findByPk(req.params.id);
    if (!devise) return res.status(404).json({ message: 'Devise non trouvée' });
    res.json(devise);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Ajout d'une devise
exports.createDevise = async (req, res) => {
  try {
    const { code, libelle, id_compte, id_dossier } = req.body;
    
    // Vérifier si le code existe déjà dans ce dossier
    const existingDevise = await Devise.findOne({
      where: { code, id_dossier, id_compte }
    });
    
    if (existingDevise) {
      return res.json({ state: false, msg: 'Ce code existe déjà dans ce dossier.' });
    }
    
    const devise = await Devise.create({ code, libelle, id_compte, id_dossier });
    return res.json({ state: true, msg: 'Devise ajoutée', data: devise });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.json({ state: false, msg: 'Ce code existe déjà dans ce dossier.' });
    }
    return res.json({ state: false, msg: 'Erreur lors de l\'ajout' });
  }
};

// Modification d'une devise
exports.updateDevise = async (req, res) => {
  try {
    const id = req.params.id;
    const { code, libelle } = req.body;
    const [nbUpdated] = await Devise.update(
      { code, libelle },
      { where: { id } }
    );
    if (nbUpdated) {
      return res.json({ state: true, msg: 'Devise modifiée' });
    } else {
      return res.json({ state: false, msg: 'Aucune devise trouvée à modifier' });
    }
  } catch (error) {
    return res.json({ state: false, msg: 'Erreur lors de la modification' });
  }
};

// Suppression d'une devise
exports.deleteDevise = async (req, res) => {
  try {
    const id = req.params.id;
    const nbDeleted = await Devise.destroy({ where: { id } });
    if (nbDeleted) {
      return res.json({ state: true, msg: 'Devise supprimée' });
    } else {
      return res.json({ state: false, msg: 'Aucune devise trouvée à supprimer' });
    }
  } catch (error) {
    return res.json({ state: false, msg: 'Erreur lors de la suppression' });
  }
}; 