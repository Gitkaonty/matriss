const db = require("../../Models");

const formatDateFr = (s) => {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d.getTime())) return String(s).substring(0,10);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

// Format amounts in French with spaces as thousand separators and 2 decimals
const fmtAmount = (value) => {
  if (value == null) return '0.00';
  try {
    return Number(value)
      .toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .replace(/\u202F/g, ' ');
  } catch {
    const num = Number(value) || 0;
    return num.toFixed(2);
  }
};

// One-line rapprochement values table
// const buildRapproTable = (row) => {
//   const headers = [
//     { text: 'Solde comptable', style: 'tableHeader' },
//     { text: 'Solde bancaire', style: 'tableHeader' },
//     { text: 'Solde non rapproché', style: 'tableHeader' },
//     { text: 'Écart', style: 'tableHeader' },
//   ];
//   const body = [headers,
//     [
//       Number(row.solde_comptable || 0).toFixed(2),
//       Number(row.solde_bancaire || 0).toFixed(2),
//       Number(row.solde_non_rapproche || 0).toFixed(2),
//       Number((Number(row.solde_comptable||0) - Number(row.solde_bancaire||0) - Number(row.solde_non_rapproche||0))).toFixed(2),
//     ]
//   ];
//   return [
//     {
//       table: { headerRows: 1, widths: ['*','*','*','*'], body },
//       layout: 'lightHorizontalLines'
//     }
//   ];
// };

const buildSummaryBlock = (row) => {
  return {
    table: {
      widths: ['auto','auto'],
      body: [
        [
          { text: 'Solde comptable', style: 'tableHeader', alignment: 'left' },
          { text: fmtAmount(row.solde_comptable || 0), alignment: 'right', noWrap: true, margin: [8,0,0,0], fillColor: '#e0e0e0' }
        ],
        [
          { text: 'Solde bancaire', style: 'tableHeader', alignment: 'left' },
          { text: fmtAmount(row.solde_bancaire || 0), alignment: 'right', noWrap: true, margin: [8,0,0,0], fillColor: '#e0e0e0' }
        ],
        [
          { text: 'Solde ligne non rapproché', style: 'tableHeader', alignment: 'left' },
          { text: fmtAmount(row.solde_non_rapproche || 0), alignment: 'right', noWrap: true, margin: [8,0,0,0], fillColor: '#e0e0e0' }
        ],
        [
          { text: 'Ecart', style: 'tableHeader', alignment: 'left' },
          { text: fmtAmount((Number(row.solde_comptable || 0) - Number(row.solde_bancaire || 0) - Number(row.solde_non_rapproche || 0))), alignment: 'right', noWrap: true, margin: [8,0,0,0], fillColor: '#e0e0e0' }
        ],
      ]
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 2,
      paddingRight: () => 2,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
    margin: [0, 0, 0, 6]
  };
};

const buildEcrituresTable = (ecritures) => {
  return {
    table: {
      headerRows: 1,
      widths: ['12%','5%','15%','*','12%','12%'],
      body: [
        [
          { text: 'Date écriture', style: 'tableHeader', alignment: 'left' },
          { text: 'Jnl', style: 'tableHeader', alignment: 'left' },
          { text: 'Compte', style: 'tableHeader', alignment: 'left' },
          { text: 'Libellé', style: 'tableHeader', alignment: 'left' },
          { text: 'Débit', style: 'tableHeader', alignment: 'right' },
          { text: 'Crédit', style: 'tableHeader', alignment: 'right' },
        ],
        ...ecritures.map(it => ([
          formatDateFr(it.dateecriture),
          it.code_journal || '',
          it.compte_ecriture || '',
          it.libelle || '',
          { text: fmtAmount(it.debit||0), alignment: 'right' },
          { text: fmtAmount(it.credit||0), alignment: 'right' },
        ]))
      ]
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingTop: () => 3,
      paddingBottom: () => 3,
      fillColor: (rowIndex) => rowIndex % 2 === 0 ? null : '#f2f2f2'
    }
  };
};

async function fetchRapproData(fileId, compteId, exerciceId, pcId, rapproId, dateDebutEx, dateFinEx) {
  const pc = await db.dossierplancomptable.findByPk(pcId);
  const row = await db.rapprochements.findOne({ where: { id: rapproId, id_dossier: fileId, id_compte: compteId, id_exercice: exerciceId, pc_id: pcId } });
  if (!row) throw new Error('Ligne de rapprochement introuvable');
  const rjson = row.toJSON ? row.toJSON() : row;
  const dateDebut = dateDebutEx;
  const dateFin = rjson?.date_fin || dateFinEx;
  const sql = `
    SELECT j.dateecriture, j.debit, j.credit, j.libelle, j.piece,
           c.compte AS compte_ecriture, cj.code AS code_journal,
           j.rapprocher, j.date_rapprochement
    FROM journals j
    JOIN codejournals cj ON cj.id = j.id_journal
    JOIN dossierplancomptables pc ON pc.id = :pcId
    JOIN dossierplancomptables c ON c.id = j.id_numcpt
    WHERE j.id_compte = :compteId
      AND j.id_dossier = :fileId
      AND j.id_exercice = :exerciceId
      AND cj.compteassocie = pc.compte
      AND j.dateecriture BETWEEN :dateDebut AND :dateFin
      AND c.compte <> pc.compte
    ORDER BY j.dateecriture ASC, j.id ASC`;
  const ecrituresAll = await db.sequelize.query(sql, {
    replacements: { fileId, compteId, exerciceId, pcId, dateDebut, dateFin },
    type: db.Sequelize.QueryTypes.SELECT,
  });
  const ecritures = (ecrituresAll || []).filter(x => !x.rapprocher);
  return { pc, rjson, ecritures };
}

async function generateRapproContent(fileId, compteId, exerciceId, pcId, rapproId, dateDebutEx, dateFinEx) {
  const { pc, rjson, ecritures } = await fetchRapproData(fileId, compteId, exerciceId, pcId, rapproId, dateDebutEx, dateFinEx);
  const summary = buildSummaryBlock(rjson);
//   const rapproTable = buildRapproTable(rjson)[0];
  const ecrituresTable = buildEcrituresTable(ecritures);
  return { pc, rjson, ecritures, summary, ecrituresTable };
}

module.exports = { generateRapproContent };
