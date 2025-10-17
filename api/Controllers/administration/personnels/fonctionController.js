const { fonctions: Fonction } = require('../../../Models');

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
    const { nom, fileId, compteId, idFonction } = req.body;

    let resData = {
      state: false,
      msg: 'Une erreur est survenue au moment du traitement.',
    }

    if (!fileId || !compteId || !nom || !idFonction) {
      return res.json({ state: false, msg: 'Champs obligatoires manquants' });
    }

    const id_compte = parseInt(compteId);
    const id_dossier = parseInt(fileId);
    const id = parseInt(idFonction);

    if (isNaN(id) || isNaN(id_compte) || isNaN(id_dossier)) {
      return res.status(400).json({
        state: false,
        message: "id_compte ou id_dossier invalide"
      });
    }

    const testIfExist = await Fonction.findAll({
      where: {
        id,
        id_compte,
        id_dossier,
      }
    })

    if (testIfExist.length === 0) {
      const fonctionAdded = await Fonction.create({
        id_compte,
        id_dossier,
        nom
      })
      if (fonctionAdded) {
        resData.state = true;
        resData.msg = "Nouvelle ligne sauvegardée avec succès.";
      } else {
        resData.state = false;
        resData.msg = "Une erreur est survenue au moment du traitement des données";
      }
    } else {
      const fonctionUpdated = await Fonction.update({
        nom,
      }, {
        where: { id }
      });
      if (fonctionUpdated) {
        resData.state = true;
        resData.msg = "Modification effectuée avec succès.";
      } else {
        resData.state = false;
        resData.msg = "Une erreur est survenue au moment du traitement des données";
      }
    }
    return res.json(resData);
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