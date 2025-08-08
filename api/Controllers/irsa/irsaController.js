const { irsa: Irsa, personnels: Personnel, fonctions: Fonction, dossiers: Dossier, userscomptes: Compte, personnels } = require('../../Models');
const PDFDocument = require('pdfkit');

exports.getAll = async (req, res) => {
  try {
    const { id_compte, id_dossier, id_exercice } = req.params;
    // On récupère toutes les IRSA sans join, uniquement les champs plats
    const list = await Irsa.findAll({
      where: {
        id_compte: Number(id_compte),
        id_dossier: Number(id_dossier),
        id_exercice: Number(id_exercice)
      }
    });
    return res.json({ state: true, list });
  } catch (error) {
    console.error('Erreur lors de la récupération IRSA:', error);
    return res.json({ state: false, msg: 'Erreur lors de la récupération', error: error.message, stack: error.stack });
  }
};

// Un seul IRSA
exports.getOne = async (req, res) => {
  try {
    const irsa = await Irsa.findByPk(req.params.id, {
      include: [
        {
          model: Personnel,
          include: [
            {
              model: Fonction,
              attributes: ['nom'],
              as: 'fonction'
            }
          ]
        },
      ]
    });
    if (!irsa) return res.status(404).json({ state: false, msg: 'Déclaration IRSA non trouvée' });
    res.json({ state: true, data: irsa });
  } catch (error) {
    res.status(500).json({ state: false, msg: 'Erreur serveur', error });
  }
};

// Ajout IRSA
exports.create = async (req, res) => {
  try {
    console.log('--- Reçu à l\'API:', req.body);

    const { personnelId, mois, annee } = req.body;
    if (!personnelId || !mois || !annee) {
      return res.status(400).json({ state: false, msg: 'personnelId, mois, annee requis' });
    }

    // Vérification stricte anti-doublon
    const exists = await Irsa.findOne({ where: { personnelId, mois, annee } });
    if (exists) {
      return res.status(409).json({ state: false, msg: 'Déjà existant pour ce personnel/mois/année', id: exists.id });
    }

    // Récupère les infos du personnel pour snapshot
    const personnel = await Personnel.findByPk(personnelId);
    const irsa = await Irsa.create({
      personnelId: req.body.personnelId,
      nom: personnel ? personnel.nom : null,
      prenom: personnel ? personnel.prenom : null,
      cnaps: personnel ? (personnel.numero_cnaps || personnel.cnaps) : null,
      cin: personnel ? (personnel.cin_ou_carte_resident || personnel.cin) : null,
      fonction: personnel ? (personnel.fonction || (personnel.id_fonction ? personnel.id_fonction : null)) : null,
      dateEntree: personnel ? personnel.date_entree : null,
      dateSortie: personnel ? personnel.date_sortie : null,
      indemniteImposable: req.body.indemniteImposable || 0,
      indemniteNonImposable: req.body.indemniteNonImposable || 0,
      avantageImposable: req.body.avantageImposable || 0,
      avantageExonere: req.body.avantageExonere || 0,
      salaireBase: req.body.salaireBase || 0,
      heuresSupp: req.body.heuresSupp || 0,
      primeGratification: req.body.primeGratification || 0,
      autres: req.body.autres || 0,
      salaireBrut: req.body.salaireBrut || 0,
      cnapsRetenu: req.body.cnapsRetenu || 0,
      ostie: req.body.ostie || 0,
      salaireNet: req.body.salaireNet || 0,
      autreDeduction: req.body.autreDeduction || 0,
      montantImposable: req.body.montantImposable || 0,
      impotCorrespondant: req.body.impotCorrespondant || 0,
      reductionChargeFamille: req.body.reductionChargeFamille || 0,
      impotDu: req.body.impotDu || 0,
      mois: req.body.mois,
      annee: req.body.annee,
      id_compte: req.body.id_compte,
      id_exercice: req.body.id_exercice,
      id_dossier: req.body.id_dossier,
    })

    return res.json({ state: true, msg: 'Déclaration IRSA ajoutée', data: irsa });
  } catch (error) {
    console.error('Erreur create IRSA:', error);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
  }

};
exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    const irsa = await Irsa.findByPk(id);
    if (!irsa) return res.status(404).json({ state: false, msg: 'IRSA non trouvée' });

    await irsa.update(req.body);

    return res.json({ state: true, msg: 'Déclaration IRSA mise à jour', data: irsa });
  } catch (error) {
    console.error('Erreur update IRSA:', error);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
  }
};

exports.exportIrsaTablePdf = async (req, res) => {
  const puppeteer = require('puppeteer');
  const { rows, header } = req.body;
  const exercice = header?.exercice || '';
  const mois = header?.mois || '';
  const annee = header?.annee || '';
  const periodeDebut = header?.periodeDebut;
  const periodeFin = header?.periodeFin;

  function formatPeriode({ jour, mois, annee }) {
    const dd = String(jour).padStart(2, '0');
    const mm = String(mois).padStart(2, '0');
    return `${dd}-${mm}-${annee}`;
  }
  const exerciceLabel = `du ${formatPeriode(periodeDebut)} au ${formatPeriode(periodeFin)}`;
  const periodeLabel = `${mois}-${annee}`;
  // 1. Génère le HTML du tableau IRSA (avec style inline ou fichier CSS)
  const html = `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 13px;
            margin-top: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          th, td {
            padding: 12px 10px; /* Hauteur ici */
            text-align: center;
            border: 1px solid #ddd;
          }

          thead {
            background-color: #1A5276;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          tr:nth-child(even) {
            background-color: #f7f9fa;
          }

          tr:hover {
            background-color: #e8f4fb;
          }
        </style>
      </head>
      <body>
        <div style="text-align:left;">
          <h2 style="text-align: center;">Declaration IRSA</h2>
          <h6 style="font-size: 12px;">Exercice :${exerciceLabel}</h6>
          <h6 style="font-size: 12px;">Mois/Année : ${periodeLabel}</h6>
        </div>
        <table style="font-size: 10px;">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Num CNAPS</th>
            <th>CIN</th>
            <th>Fonction</th>
            <th>Date Entree</th>
            <th>Date Sortie</th>
            <th>Indemnite Imposable</th>
            <th>Indemnite Non Imposable</th>
            <th>Avantage Imposable</th>
            <th>Avantage Exonere</th>
            <th>Salaire Base</th>
            <th>Heures Sup</th>
            <th>Prime</th>
            <th>Autres</th>
            <th>Salaire Brut</th>
            <th>Cnaps Retenu</th>
            <th>Ostie</th>
            <th>Salaire Net</th>
            <th>Autre Deduction</th>
            <th>Montant Imposable</th>
            <th>Impot Correspondant</th>
            <th>Reduction Charge Famille</th>
            <th>Impot Du</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td>${row.nom || ''}</td>
              <td>${row.prenom || ''}</td>
              <td>${row.cnaps || ''}</td>
              <td>${row.cin || ''}</td>
              <td>${row.fonction || ''}</td>
              <td>${row.dateEntree || ''}</td>
              <td>${row.dateSortie || ''}</td>
              <td>${row.indemniteImposable || ''}</td>
              <td>${row.indemniteNonImposable || ''}</td>
              <td>${row.avantageImposable || ''}</td>
              <td>${row.avantageExonere || ''}</td>
              <td>${row.salaireBase || ''}</td>
              <td>${row.heuresSupp || ''}</td>
              <td>${row.primeGratification || ''}</td>
              <td>${row.autres || ''}</td>
              <td>${row.salaireBrut || ''}</td>
              <td>${row.cnapsRetenu || ''}</td>
              <td>${row.ostie || ''}</td>
              <td>${row.salaireNet || ''}</td>
              <td>${row.autreDeduction || ''}</td>
              <td>${row.montantImposable || ''}</td>
              <td>${row.impotCorrespondant || ''}</td>
              <td>${row.reductionChargeFamille || ''}</td>
              <td>${row.impotDu || ''}</td>
            </tr>
          `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // 2. Génère le PDF avec Puppeteer
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A3',
    landscape: true, // ✅ AFFICHAGE EN PAYSAGE
    printBackground: true
  });
  await browser.close();

  // 3. Envoie le PDF
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="export_irsa.pdf"');
  res.end(pdfBuffer);
};


exports.generateIrsaBatchSnapshot = async (req, res) => {
  try {
    const { paies } = req.body;
    if (!Array.isArray(paies) || paies.length === 0) {
      return res.status(400).json({ state: false, msg: 'Aucune fiche de paie fournie.' });
    }
    const created = [];
    for (const paie of paies) {
      const personnelId = Number(paie.personnelId);
      const mois = Number(paie.mois);
      const annee = Number(paie.annee);
      if (!personnelId || !mois || !annee) continue;
      // Vérification stricte anti-doublon
      const exists = await Irsa.findOne({ where: { personnelId, mois, annee } });
      if (exists) continue;
      // Snapshot du personnel
      const personnel = await Personnel.findByPk(personnelId);
      const irsaData = {
        personnelId,
        nom: personnel ? personnel.nom : null,
        prenom: personnel ? personnel.prenom : null,
        cnaps: personnel ? (personnel.numero_cnaps || personnel.cnaps) : null,
        cin: personnel ? (personnel.cin_ou_carte_resident || personnel.cin) : null,
        fonction: personnel ? (personnel.fonction || (personnel.id_fonction ? personnel.id_fonction : null)) : null,
        dateEntree: personnel ? personnel.date_entree : null,
        dateSortie: personnel ? personnel.date_sortie : null,
        indemniteImposable: paie.indemnites || 0,
        indemniteNonImposable: paie.indemniteNonImposable || 0,
        avantageImposable: paie.totalAvantageNature || 0,
        avantageExonere: paie.avantageExonere || 0,
        salaireBase: paie.salaireBase || 0,
        heuresSupp: paie.heuresSup || 0,
        primeGratification: paie.prime || 0,
        autres: paie.remunerationFerieDimanche || 0,
        salaireBrut: paie.totalSalaireBrut || 0,
        cnapsRetenu: paie.cnapsEmployeur || 0,
        ostie: paie.ostieEmployeur || 0,
        salaireNet: paie.baseImposable || 0,
        autreDeduction: paie.autreDeduction || 0,
        montantImposable: paie.montantImposable || 0,
        impotCorrespondant: paie.impotCorrespondant || 0,
        reductionChargeFamille: paie.deductionEnfants || 0,
        // Calcul IRSA selon barème sur salaireNet
        impotDu: (() => {
          const salaireNet = paie.baseImposable || 0;
          let calcul = 0;
          if (salaireNet <= 400000) {
            calcul = (salaireNet - 350000) * 0.05;
          } else if (salaireNet <= 500000) {
            calcul = 2500 + (salaireNet - 400000) * 0.10;
          } else if (salaireNet <= 600000) {
            calcul = 12500 + (salaireNet - 500000) * 0.15;
          } else if (salaireNet > 600000) {
            calcul = 27500 + (salaireNet - 600000) * 0.20;
          }
          // Appliquer la déduction enfants si présente
          const deductionEnfants = Number(paie.deductionEnfants) || 0;
          const calc = calcul - deductionEnfants;
          return calc <= 3000 ? 3000 : calc;
        })(),
        mois,
        annee,
        id_compte: paie.id_compte,
        id_dossier: paie.id_dossier,
        id_exercice: paie.id_exercice,
      };
      const irsa = await Irsa.create(irsaData);
      created.push(irsa);
    }
    return res.json({ state: true, msg: 'Déclarations IRSA générées', list: created });
  } catch (error) {
    console.error('[IRSA][BATCH][ERROR] Erreur batch IRSA:', error);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
  }
};



exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const irsa = await Irsa.findByPk(id);
    if (!irsa) return res.status(404).json({ state: false, msg: 'IRSA non trouvée' });

    await irsa.destroy();

    return res.json({ state: true, msg: 'Déclaration IRSA supprimée' });
  } catch (error) {
    console.error('Erreur delete IRSA:', error);
    return res.status(500).json({ state: false, msg: 'Erreur serveur', error: error.message });
  }

};



