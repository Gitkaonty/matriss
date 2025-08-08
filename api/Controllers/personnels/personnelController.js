const db = require('../../Models');
const Personnel = db.personnels;
const Fonction = db.fonctions;
const Classification = db.classifications;

// Liste des personnels
exports.getAll = async (req, res) => {
  try {
    const { id_compte, id_dossier } = req.params;
    console.log(id_compte, id_dossier);
    console.log('--- Appel à GET /sociales/personnel ---');
    const list = await Personnel.findAll({
      where: { id_compte: id_compte, id_dossier: id_dossier },
      include: [
        { model: Fonction, attributes: ['id', 'nom'], as: 'fonction' },
        { model: Classification, attributes: ['id', 'classe'], as: 'classification' }
      ]
    });
    console.log('Liste des personnels trouvée:', Array.isArray(list) ? list.length : list);
    if (Array.isArray(list) && list.length > 0) {
      console.log('Exemple personnel:', list[0]);
    }
    return res.json({ state: true, list });
  } catch (error) {
    console.error('Erreur lors de la récupération des personnels:', error);
    return res.json({ state: false, msg: 'Erreur lors de la récupération', error: error.message, stack: error.stack });
  }
};

// Récupère un personnel par id
exports.getOne = async (req, res) => {
  try {
    const personnel = await Personnel.findByPk(req.params.id, {
      include: [
        { model: Fonction, as: 'fonction', attributes: ['id', 'nom'] },
        { model: Classification, as: 'classification', attributes: ['id', 'classe'] }
      ]
    });
    if (!personnel) return res.status(404).json({ state: false, msg: 'Personnel non trouvé' });
    res.json({ state: true, data: personnel });
  } catch (error) {
    console.error('Erreur getOne personnel:', error);
    res.status(500).json({ state: false, msg: 'Erreur serveur', error });
  }
};


// Ajout d'un personnel
exports.create = async (req, res) => {
  try {
    console.log('--- Appel à POST /sociales/personnel ---');
    console.log('Données reçues pour création personnel:', req.body);
    const { nom, prenom, id_fonction, id_classe, date_entree, date_sortie, actif, numero_cnaps, cin_ou_carte_resident, nombre_enfants_charge, id_dossier, id_compte } = req.body;
    if (!nom || !prenom || !id_fonction || !id_classe || !date_entree) {
      console.error('Champs obligatoires manquants:', { nom, prenom, id_fonction, id_classe, date_entree });
      return res.json({ state: false, msg: 'Champs obligatoires manquants', fields: { nom, prenom, id_fonction, id_classe, date_entree, nombre_enfants_charge } });
    }
    const personnel = await Personnel.create({ nom, prenom, id_fonction, id_classe, date_entree, date_sortie, actif, numero_cnaps, cin_ou_carte_resident, nombre_enfants_charge, id_dossier, id_compte });
    console.log('Personnel créé avec succès:', personnel);
    return res.json({ state: true, msg: 'Personnel ajouté', data: personnel });
  } catch (error) {
    console.error('Erreur lors de la création du personnel:', error);
    return res.json({ state: false, msg: "Erreur lors de l'ajout", error: error.message, stack: error.stack });
  }
};

// Modification d'un personnel
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { nom, prenom, id_fonction, id_classe, date_entree, date_sortie, actif, numero_cnaps, cin_ou_carte_resident, nombre_enfants_charge } = req.body;
    const [nbUpdated] = await Personnel.update(
      { nom, prenom, id_fonction, id_classe, date_entree, date_sortie, actif, numero_cnaps, cin_ou_carte_resident, nombre_enfants_charge },
      { where: { id } }
    );
    if (nbUpdated) {
      return res.json({ state: true, msg: 'Personnel modifié' });
    } else {
      return res.json({ state: false, msg: 'Aucun personnel trouvé à modifier' });
    }
  } catch (error) {
    return res.json({ state: false, msg: 'Erreur lors de la modification', error });
  }
};

// Suppression d'un personnel
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const nbDeleted = await Personnel.destroy({ where: { id } });
    if (nbDeleted) {
      return res.json({ state: true, msg: 'Personnel supprimé' });
    } else {
      return res.json({ state: false, msg: 'Aucun personnel trouvé à supprimer' });
    }
  } catch (error) {
    return res.json({ state: false, msg: 'Erreur lors de la suppression' });
  }
};