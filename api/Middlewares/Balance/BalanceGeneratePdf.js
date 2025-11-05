const db = require('../../Models');
const Sequelize = require('sequelize');
const { Op } = Sequelize;

const dossierplancomptable = db.dossierplancomptable;
const balances = db.balances;

const generateBalanceContent = async (id_compte, id_dossier, id_exercice, centraliser, unSolded, movmentedCpt) => {
  const whereBalance = {
    id_compte: Number(id_compte),
    id_dossier: Number(id_dossier),
    id_exercice: Number(id_exercice),
    valeur: { [Op.gt]: unSolded ? 0 : -1 },
    [Op.or]: [
      { mvtdebit: { [Op.gt]: movmentedCpt ? 0 : -1 } },
      { mvtcredit: { [Op.gt]: movmentedCpt ? 0 : -1 } }
    ]
  };

  const list = await balances.findAll({
    where: whereBalance,
    include: [
      {
        model: dossierplancomptable,
        as: 'compteLibelle',
        attributes: [
          ['compte', 'compte'],
          ['libelle', 'libelle'],
          ['nature', 'nature']
        ],
        required: true,
        where: {
          id_compte: Number(id_compte),
          id_dossier: Number(id_dossier),
          nature: { [Op.ne]: centraliser ? 'Aux' : 'Collectif' }
        }
      }
    ],
    raw: true,
    order: [[{ model: dossierplancomptable, as: 'compteLibelle' }, 'compte', 'ASC']]
  });

  const buildTable = (data) => {
    const body = [];
    body.push([
      { text: 'Compte', style: 'tableHeader' },
      { text: 'Libellé', style: 'tableHeader' },
      { text: 'Mouvement débit', style: 'tableHeader' },
      { text: 'Mouvement crédit', style: 'tableHeader' },
      { text: 'Solde débit', style: 'tableHeader' },
      { text: 'Solde crédit', style: 'tableHeader' }
    ]);

    let totMvtD = 0, totMvtC = 0, totSoldeD = 0, totSoldeC = 0;
    const fmt = (v) =>
      Number(v || 0)
        .toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .replace(/\u202F/g, ' ');

    data.forEach((r, i) => {
      const isEven = i % 2 === 0; // lignes paires et impaires
      const rowColor = isEven ? '#FFFFFF' : '#F8F9F9'; // blanc / gris clair

      totMvtD += Number(r.mvtdebit || 0);
      totMvtC += Number(r.mvtcredit || 0);
      totSoldeD += Number(r.soldedebit || 0);
      totSoldeC += Number(r.soldecredit || 0);

      body.push([
        { text: r['compteLibelle.compte'] || '', alignment: 'left', margin: [0, 2, 0, 2], fillColor: rowColor },
        { text: r['compteLibelle.libelle'] || '', alignment: 'left', margin: [0, 2, 0, 2], fillColor: rowColor },
        { text: fmt(r.mvtdebit), alignment: 'right', margin: [0, 2, 0, 2], fillColor: rowColor },
        { text: fmt(r.mvtcredit), alignment: 'right', margin: [0, 2, 0, 2], fillColor: rowColor },
        { text: fmt(r.soldedebit), alignment: 'right', margin: [0, 2, 0, 2], fillColor: rowColor },
        { text: fmt(r.soldecredit), alignment: 'right', margin: [0, 2, 0, 2], fillColor: rowColor }
      ]);
    });

    // Ligne total
    body.push([
      { text: 'TOTAL', bold: true, alignment: 'left', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
      { text: '', fillColor: '#89A8B2' },
      { text: fmt(totMvtD), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
      { text: fmt(totMvtC), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
      { text: fmt(totSoldeD), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' },
      { text: fmt(totSoldeC), bold: true, alignment: 'right', margin: [0, 2, 0, 2], fillColor: '#89A8B2' }
    ]);

    return [
      {
        table: {
          headerRows: 1,
          widths: [70, '*', 100, 100, 100, 100],
          body
        },
        layout: 'lightHorizontalLines'
      }
    ];
  };

  return { buildTable, list };
};

module.exports = { generateBalanceContent };
