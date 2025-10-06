// Contrôleur unifié pour l'historique des déclarations (IRSA/TVA)
const db = require('../../Models');
const HistoriqueIrsa = db.historiqueirsa; // table existante: historique_irsa

// POST /historique/declaration
exports.createHistorique = async (req, res) => {
  try {
    const { idCompte, idDossier, designation, declaration } = req.body;
    const record = await HistoriqueIrsa.create({
      idCompte,
      idDossier,
      declaration: declaration && typeof declaration === 'string' ? declaration.toUpperCase() : 'IRSA',
      designation,
      date_export: new Date(),
    });
    res.status(201).json({ success: true, historique: record });
  } catch (error) {
    console.error('[HISTORIQUES DECLARATION][CREATE]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /historique/declaration? idCompte=&idDossier=&declaration=
exports.getHistoriques = async (req, res) => {
  try {
    const { idCompte, idDossier, declaration } = req.query;
    const where = {};
    if (idCompte) where.idCompte = idCompte;
    if (idDossier) where.idDossier = idDossier;
    if (declaration) where.declaration = String(declaration).toUpperCase();

    const historique = await HistoriqueIrsa.findAll({
      where,
      include: [
        { model: db.dossiers, as: 'dossier', attributes: ['id', 'dossier'] },
        { model: db.userscomptes, as: 'compte', attributes: ['id', 'nom'] },
      ],
      order: [['date_export', 'DESC']],
    });

    res.json({ success: true, historique });
  } catch (error) {
    console.error('[HISTORIQUES DECLARATION][GET]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
