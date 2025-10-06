
const { paies: Paie, personnels: Personnel, fonctions: Fonction, classifications: Classification } = require('../../../Models');

// ✅ Exporter le template CSV Paie
exports.exportPaieTemplate = (req, res) => {
  // Mettre à jour cette liste selon les colonnes attendues à l'import côté backend
  const columns = [
    'matricule','mois', 'annee', 'salaireBase', 'prime', 'heuresSup', 'indemnites', 'remunerationFerieDimanche',
    'assurance', 'carburant', 'entretienReparation', 'loyerMensuel', 'depenseTelephone', 'autresAvantagesNature',
    'avanceQuinzaineAutres', 'avancesSpeciales', 'allocationFamiliale'
  ];
  const header = columns.join(';');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="modele_import_paie.csv"');
  res.send(header + '\r\n');
};

// ✅ Lister toutes les paies
exports.getAll = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice } = req.params;
    const paies = await Paie.findAll({
      include: [
        {
          model: Personnel,
          as: 'personnel',
          attributes: ['id', 'matricule', 'nom', 'prenom', 'id_fonction', 'id_classe', 'date_entree', 'date_sortie'],
          include: [
            {
              model: Fonction,
              as: 'fonction',
              attributes: ['nom']
            },
            {
              model: Classification,
              as: 'classification',
              attributes: ['classe']
            }
          ]
        }
      ],
      where: {
        id_compte: Number(id_compte),
        id_dossier: Number(id_dossier),
        id_exercice: Number(id_exercice)
      }
    });

    return res.json({ state: true, list: paies });

  } catch (error) {
    console.error('Erreur getAll:', error);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
  }
};


const computePaieFields = require('../../../Utils/computePaieFields');

exports.create = async (req, res) => {
  try {
    console.log('----Reçu à l\'API:', req.body);

    // Vérifier si les champs calculés sont déjà présents (import CSV)
    const hasCalculatedFields = req.body.totalSalaireBrut !== undefined &&
      req.body.totalSalaireBrut !== null &&
      req.body.totalSalaireBrut !== '';

    if (!hasCalculatedFields) {
      // Calcul automatique des champs dérivés si données brutes fournies
      console.log('[DEBUG] Calcul des champs côté backend car non calculés');
      const calculs = computePaieFields(req.body, req.body.nombre_enfants_charge);
      // Fusionne les champs calculés dans req.body
      Object.assign(req.body, calculs);
    } else {
      console.log('[DEBUG] Champs déjà calculés côté frontend, pas de recalcul');
    }

    console.log('[DEBUG] totalSalaireBrut reçu:', req.body.totalSalaireBrut);
    // Accepter matricule ou personnelId. Si personnelId manquant mais matricule présent, on résout côté backend
    let { personnelId } = req.body;
    const matricule = req.body.matricule ? String(req.body.matricule).trim() : '';
    if (!personnelId && matricule) {
      const where = { matricule };
      if (req.body.id_compte) where.id_compte = req.body.id_compte;
      if (req.body.id_dossier) where.id_dossier = req.body.id_dossier;
      // Ne pas filtrer par id_exercice: la table personnels n'a pas cette colonne
      const p = await Personnel.findOne({ where });
      if (!p) return res.status(404).json({ state: false, msg: `Personnel introuvable pour matricule ${matricule}` });
      personnelId = p.id;
      req.body.personnelId = personnelId;
    }
    if (!req.body.personnelId) {
      return res.status(400).json({ state: false, msg: 'personnelId ou matricule est requis' });
    }
    console.log(req.body.mois, req.body.annee)
    console.log('[DEBUG] totalSalaireBrut envoyé à Sequelize:', req.body.totalSalaireBrut);
    const paie = await Paie.create({
      personnelId: req.body.personnelId,
      matricule: req.body.matricule,
      salaireBase: req.body.salaireBase || 0,
      prime: req.body.prime || 0,
      heuresSup: req.body.heuresSup || 0,
      indemnites: req.body.indemnites || 0,
      remunerationFerieDimanche: req.body.remunerationFerieDimanche || 0,
      salaireBrutNumeraire: req.body.salaireBrutNumeraire || 0,
      assurance: req.body.assurance || 0,
      carburant: req.body.carburant || 0,
      entretienReparation: req.body.entretienReparation || 0,
      totalDepensesVehicule: req.body.totalDepensesVehicule || 0,
      totalAvantageNatureVehicule: req.body.totalAvantageNatureVehicule || 0, 
      loyerMensuel: req.body.loyerMensuel || 0,
      remunerationFixe25: req.body.remunerationFixe25 || 0,
      avantageNatureLoyer: req.body.avantageNatureLoyer || 0,
      depenseTelephone: req.body.depenseTelephone || 0,
      avantageNatureTelephone: req.body.avantageNatureTelephone || 0,
      autresAvantagesNature: req.body.autresAvantagesNature || 0,
      totalAvantageNature: req.body.totalAvantageNature || 0,
      salaireBrut20: req.body.salaireBrut20 || 0,
      cnapsEmployeur: req.body.cnapsEmployeur || 0,
      baseImposable: req.body.baseImposable || 0,
      ostieEmployeur: req.body.ostieEmployeur || 0,
      totalSalaireBrut: req.body.totalSalaireBrut || 0,
      irsaBrut: req.body.irsaBrut || 0,
      deductionEnfants: req.body.deductionEnfants || 0,
      irsaNet: req.body.irsaNet || 0,
      salaireNet: req.body.salaireNet || 0,
      avanceQuinzaineAutres: req.body.avanceQuinzaineAutres || 0,
      avancesSpeciales: req.body.avancesSpeciales || 0,
      allocationFamiliale: req.body.allocationFamiliale || 0,
      netAPayerAriary: req.body.netAPayerAriary || 0,
      partPatronalCnaps: req.body.partPatronalCnaps || 0,
      partPatronalOstie: req.body.partPatronalOstie || 0,
      mois: req.body.mois,
      annee: req.body.annee,
      id_compte: req.body.id_compte,
      id_dossier: req.body.id_dossier,
      id_exercice: req.body.id_exercice,

    });
    console.log('[DEBUG] paie créée:', paie && paie.totalSalaireBrut);
    return res.json({ state: true, msg: 'Paie créée avec succès', data: paie });
  } catch (error) {
    console.error('Erreur création paie:', error);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });

  }
};

// ✅ Obtenir une paie par son ID
exports.getOne = async (req, res) => {
  try {
    const id = req.params.id;
    const paie = await Paie.findByPk(id, {
      include: [
        {
          model: Personnel,
          as: 'personnel',
          attributes: ['id', 'matricule', 'nom', 'prenom', 'id_fonction', 'id_classe', 'date_entree', 'date_sortie'],
          include: [
            {
              model: Fonction,
              as: 'fonction',
              attributes: ['nom']
            },
            {
              model: Classification,
              as: 'classification',
              attributes: ['classe']
            }
          ]
        }
      ]
    });

    if (!paie) {
      return res.status(404).json({ state: false, msg: 'Paie non trouvée' });
    }

    return res.json({ state: true, data: paie });

  } catch (error) {
    console.error('Erreur getOne:', error);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
  }
};


// ✅ Mettre à jour une paie
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    // On ne prend que les champs explicitement listés pour éviter toute injection
    const fields = [
      'salaireBase', 'prime', 'heuresSup', 'indemnites', 'remunerationFerieDimanche', 'salaireBrutNumeraire', 'assurance', 'carburant', 'entretienReparation', 'totalDepensesVehicule', 'totalAvantageNatureVehicule', 'loyerMensuel', 'remunerationFixe25', 'avantageNatureLoyer', 'depenseTelephone', 'avantageNatureTelephone', 'autresAvantagesNature', 'totalAvantageNature', 'salaireBrut20', 'cnapsEmployeur', 'baseImposable', 'ostieEmployeur', 'mois', 'annee',
      'totalSalaireBrut', 'irsaBrut', 'deductionEnfants', 'irsaNet', 'salaireNet', 'avanceQuinzaineAutres', 'avancesSpeciales', 'allocationFamiliale', 'netAPayerAriary', 'partPatronalCnaps', 'partPatronalOstie'
    ];
    const data = {};
    fields.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });
    await Paie.update(data, { where: { id } });

    return res.json({ state: true, msg: 'Paie mise à jour avec succès' });

  } catch (error) {
    console.error('Erreur update paie:', error);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
  }
};


// Supprimer
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const paie = await Paie.findByPk(id);
    if (!paie) return res.status(404).json({ state: false, msg: 'Paie non trouvée' });

    await paie.destroy();
    return res.json({ state: true, msg: 'Paie supprimée' });
  } catch (error) {
    return res.status(500).json({ state: false, msg: 'Erreur delete', error: error.message });
  }
};
