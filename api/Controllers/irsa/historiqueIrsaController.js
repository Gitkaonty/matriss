// Controller pour historique des exports IRSA
const db = require('../../Models');
const HistoriqueIrsa = db.historiqueirsa;

// Créer un enregistrement d'export IRSA
exports.createHistoriqueIrsa = async (req, res) => {
  try {
    const { idCompte, idDossier, designation } = req.body;
    const record = await HistoriqueIrsa.create({
      idCompte,
      idDossier,
      declaration: 'IRSA',
      designation,
      date_export: new Date()
    });
    res.status(201).json({ success: true, historique: record });
  }catch (error) {
    console.error('[HISTORIQUE IRSA]', error); // ← DÉJÀ PRÉSENT
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer l'historique des exports IRSA (optionnel : filtrage par compte/dossier)
exports.getHistoriqueIrsa = async (req, res) => {
  try {
    const { idCompte, idDossier } = req.query;
    const where = {};
    if (idCompte) where.idCompte = idCompte;
    if (idDossier) where.idDossier = idDossier;
    const historique = await HistoriqueIrsa.findAll({
      where,
      include: [
        {
          model: db.dossiers,
          as: 'dossier',
          attributes: ['id', 'dossier']
        },
        {
          model: db.userscomptes,
          as: 'compte',
          attributes: ['id', 'nom']
        }
      ],
      order: [['date_export', 'DESC']]
    });
    res.json({ success: true, historique });
  } catch (error) {
    console.error('[HISTORIQUE IRSA]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
