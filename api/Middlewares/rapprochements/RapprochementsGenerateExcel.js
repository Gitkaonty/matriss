const db = require("../../Models");
const ExcelJS = require('exceljs');

const dossierplancomptables = db.dossierplancomptable;
const rapprochements = db.rapprochements;

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString).substring(0,10);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

async function getRowAndEcritures(fileId, compteId, exerciceId, pcId, rapproId, dateDebutEx, dateFinEx) {
  const pc = await dossierplancomptables.findByPk(pcId);
  const row = await rapprochements.findOne({ where: { id: rapproId, id_dossier: fileId, id_compte: compteId, id_exercice: exerciceId, pc_id: pcId } });
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

async function exportRapprochementExcel(fileId, compteId, exerciceId, pcId, rapproId, workbook, dossierName, userName, dateDebutEx, dateFinEx) {
  const ws = workbook.addWorksheet('Rapprochement');
  const { pc, rjson, ecritures } = await getRowAndEcritures(fileId, compteId, exerciceId, pcId, rapproId, dateDebutEx, dateFinEx);

  ws.addRow(['RAPPROCHEMENT BANCAIRE']).font = { bold: true, size: 16 };
  ws.mergeCells('A1:F1');
  ws.getCell('A1').alignment = { horizontal: 'left' };
  const dossierRow = ws.addRow([`Dossier: ${dossierName || ''}`]);
  ws.mergeCells(`A${dossierRow.number}:F${dossierRow.number}`);
  ws.getCell(`A${dossierRow.number}`).alignment = { horizontal: 'left' };
  ws.getCell(`A${dossierRow.number}`).font = { bold: true };
  ws.addRow([`Exercice: ${formatDate(dateDebutEx)} - ${formatDate(dateFinEx)}`]);
  ws.addRow([`Période: du ${formatDate(rjson?.date_debut)} au ${formatDate(rjson?.date_fin)}`]);
  ws.addRow([]);

  const ecart = Number(rjson.solde_comptable||0) - Number(rjson.solde_bancaire||0) - Number(rjson.solde_non_rapproche||0);
  const startRow = ws.lastRow.number + 1;
  ws.addRow(['Solde comptable', Number(rjson.solde_comptable||0)]);
  ws.addRow(['Solde bancaire', Number(rjson.solde_bancaire||0)]);
  ws.addRow(['Solde ligne non rapproché', Number(rjson.solde_non_rapproche||0)]);
  ws.addRow(['Ecart', ecart]);
  for (let i = 0; i < 4; i++) {
    const rowIndex = startRow + i;
    const left = ws.getCell(`A${rowIndex}`);
    const right = ws.getCell(`B${rowIndex}`);
    // Left (label) styled like PDF header: dark blue background with white text
    left.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } };
    left.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    left.alignment = { horizontal: 'left' };
    right.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E0E0' } };
    right.alignment = { horizontal: 'right' };
    right.numFmt = '# ##0.00';
  }
  ws.addRow([]);

  const titleRow = ws.addRow(['Ecritures']);
  titleRow.font = { bold: true };
  const header = ws.addRow(['Date écriture','Code journal','Compte','Libellé','Débit','Crédit']);
  // Apply PDF-like header styling
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } };
  for (let c = 1; c <= 6; c++) {
    const cell = header.getCell(c);
    cell.fill = headerFill;
    // Align like PDF headers (text left, amounts right)
    if (c <= 4) cell.alignment = { horizontal: 'left' };
    else cell.alignment = { horizontal: 'right' };
  }
  // ensure right alignment and number format on amount columns
  ws.getColumn(5).alignment = { horizontal: 'right' };
  ws.getColumn(6).alignment = { horizontal: 'right' };
  ws.getColumn(5).numFmt = '# ##0.00';
  ws.getColumn(6).numFmt = '# ##0.00';
  for (const it of ecritures) {
    const r = ws.addRow([
      formatDate(it.dateecriture),
      it.code_journal || '',
      it.compte_ecriture || '',
      it.libelle || '',
      Number(it.debit||0),
      Number(it.credit||0),
    ]);
    // if needed, could set row-level alignment, but columns already set
  }
  // Fix explicit widths for each column (Date, Jnl, Compte, Libellé, Débit, Crédit)
  ws.columns = [
    { width: 14 },  // Date écriture
    { width: 8 },   // Code journal
    { width: 16 },  // Compte
    { width: 45 },  // Libellé
    { width: 16 },  // Débit
    { width: 16 },  // Crédit
  ];
}

module.exports = { exportRapprochementExcel };
