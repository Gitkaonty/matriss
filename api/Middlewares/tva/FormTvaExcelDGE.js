const exportFormulaireTvaExcel = async ({ workbook, rows, meta, detailsByCode = {} }) => {
  const sheet = workbook.addWorksheet('Formulaire TVA');

  sheet.columns = [
    { header: 'Code', key: 'id_code', width: 10 }, // A
    { header: 'Libellé', key: 'libelle', width: 120 }, // B
    { header: '', key: 'c', width: 25},  // C spacer
    { header: '', key: 'd', width: 35 },  // D spacer
    { header: '', key: 'e', width: 25 },  // E spacer
    { header: '', key: 'f', width: 25 },  // F (HT détails)
    { header: 'Montant', key: 'montant', width: 25 }, // G (TVA détails)
    // { header: 'Montant', key: 'montant', width: 25 }, // H
  ];

  // Titre
  const { dossier = '', compte = '', exercice = '', mois = null, annee = null, mode = 'cfisc' } = meta || {};
  const title = String(mode).toLowerCase() === 'dge' ? 'Formulaire TVA - Modèle DGE' : 'Formulaire TVA - Modèle Centre fiscal';
  sheet.insertRow(1, [title]);
  sheet.mergeCells('A1:G1');
  const r1 = sheet.getRow(1);
  r1.font = { bold: true, size: 18 ,name: 'Arial'};
  r1.alignment = { horizontal: 'center', vertical: 'middle' };
  r1.height = 24;

  // Sous-titre
  const sous = `Dossier: ${dossier}\nCompte: ${compte}\nExercice: ${exercice}${(mois && annee) ? `\nPériode: ${mois}/${annee}` : ''}`;
  sheet.insertRow(2, [sous]);
  sheet.mergeCells('A2:G2');
  const r2 = sheet.getRow(2);
  r2.font = { bold: true, size: 12 ,name: 'Arial'};
  r2.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  r2.height = 48;

  // Header paint helper
  const paintHeader = (rowNumber) => {
    const header = sheet.getRow(rowNumber);
    header.eachCell((c) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } };
      c.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial' };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  };

  let currentRow = 3;
  const fmtNumber = (n) => Number(n || 0);
  const includeDetails = !!(meta && meta.includeDetails);

  // Helper: write inline details subtable under a code line
  const writeInlineDetails = (code) => {
    const list = detailsByCode && detailsByCode[String(Number(code))];
    if (!includeDetails || !list || list.length === 0) return;
    // Header for details (shifted by 1: starts at column B)
    sheet.insertRow(currentRow, ['', 'Réf.', 'Date', 'Libellé','Montant HT', 'Montant TVA']);
    ['B','C','D','E','F'].forEach((col) => {
      const cell = sheet.getCell(`${col}${currentRow}`);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF94C6FF' } };
      cell.font = { bold: true, color: { argb: 'FF000000' }, size: 10, name: 'Arial' };
      cell.alignment = { horizontal: col === 'D' ? 'left' : 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      };
    });
    sheet.getRow(currentRow).height = 18; // details header height
    currentRow++;
    // Detail rows
    let totHT = 0, totTVA = 0;
    for (const d of list) {
      const mht = Number(d.montant_ht || 0);
      const mtva = Number(d.montant_tva || 0);
      totHT += mht; totTVA += mtva;
      sheet.insertRow(currentRow, [
        '',
        d.reference_facture || '',
        d.date_facture ? String(d.date_facture).slice(0,10) : '',
        d.libelle_operation || '',
        mht,
        mtva,
      ]);
      sheet.getCell(`E${currentRow}`).numFmt = '#,##0.00';
      sheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
      sheet.getCell(`E${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`F${currentRow}`).alignment = { horizontal: 'right', vertical: 'middle' };
      sheet.getCell(`E${currentRow}`).font = { name: 'Arial', size: 10 };
      sheet.getCell(`F${currentRow}`).font = { name: 'Arial', size: 10 };
      sheet.getRow(currentRow).height = 14; // details row height
      currentRow++;
    }
    // Total line
    sheet.insertRow(currentRow, ['', 'Total détails', '', '',totHT, totTVA]);
    ['B','C','D','E','F'].forEach((col) => {
      const cell = sheet.getCell(`${col}${currentRow}`);
      if (!cell.value) cell.value = '';
      cell.font = { bold: true, name: 'Arial' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F3F4' } };
      cell.alignment = { horizontal: (col === 'E' || col === 'F') ? 'right' : 'left', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      };
    });
    sheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
    sheet.getCell(`G${currentRow}`).numFmt = '#,##0.00';
    sheet.getRow(currentRow).height = 16; // total details height
    currentRow++;
  };

  if (String(mode).toLowerCase() === 'dge') {
    const groups = [
      { code: '01', title: "01 DETERMINATION DU CHIFFRE D'AFFAIRES" },
      { code: '02', title: '02 TVA COLLECTEE' },
      { code: '03', title: '03 TVA DEDUCTIBLE' },
      { code: '04', title: '04 CREDITS ET REGULARISATION' },
      { code: '05', title: '05 SYNTHESE' },
    ];
    let grandTotal = 0;
    for (const g of groups) {
      const groupRows = (rows || []).filter(r => String(r.groupe || '') === g.code);
      if (!groupRows || groupRows.length === 0) continue;
      // Section title (merged)
      sheet.insertRow(currentRow, [g.title]);
      sheet.mergeCells(`A${currentRow}:F${currentRow}`);
      const st = sheet.getRow(currentRow);
      st.font = { bold: true, color: { argb: 'FF155724' }, name: 'Arial' };
      st.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
      st.alignment = { horizontal: 'left', vertical: 'middle' };
      st.height = 20; // section title height
      currentRow++;

      // Header
      paintHeader(currentRow);
      sheet.getRow(currentRow).height = 18; // header height
      currentRow++;

      // Data rows
      let subtotal = 0;
      for (const r of groupRows) {
        const montant = fmtNumber(r.montant);
        subtotal += montant;
        grandTotal += montant;
        // Insert with Montant in column H
        sheet.insertRow(currentRow, [Number(r.id_code), r.libelle || '', '', '', '', '', montant]);
        // Smaller font for code rows
        const rowIdx = currentRow;
        sheet.getCell(`A${rowIdx}`).font = { name: 'Arial', size: 10 };
        sheet.getCell(`B${rowIdx}`).font = { name: 'Arial', size: 10 };
        sheet.getCell(`G${rowIdx}`).font = { name: 'Arial', size: 10 };
        sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        sheet.getCell(`G${rowIdx}`).alignment = { horizontal: 'right', vertical: 'middle' };
        sheet.getRow(rowIdx).height = 18; // code row height
        currentRow++;
        // Inline details under the code row (like PDF)
        writeInlineDetails(r.id_code);
      }

    }

    // Grand total
    sheet.insertRow(currentRow, ['TOTAL', '', '', '', '', '', grandTotal]);
    ['A','B','C','D','E','F','G'].forEach((col) => {
      const cell = sheet.getCell(`${col}${currentRow}`);
      if (!cell.value) cell.value = '';
      cell.font = { bold: true, name: 'Arial' };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF89A8B2' } };
      cell.alignment = { horizontal: (col === 'G' ? 'right' : 'left'), vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      };
    });
    sheet.getRow(currentRow).height = 18; // grand total height
    sheet.getColumn(7).numFmt = '#,##0.00';
    return;
  }

  // CFISC flat fallback
  paintHeader(currentRow);
  currentRow++;
  let total = 0;
  (rows || []).forEach((r) => {
    const montant = fmtNumber(r.montant);
    total += montant;
    // Insert with Montant in column G
    sheet.insertRow(currentRow, [Number(r.id_code), r.libelle || '', '', '', '', '', montant]);
    // Smaller font for code rows
    const rowIdx = currentRow;
    sheet.getCell(`A${rowIdx}`).font = { name: 'Arial', size: 10 };
    sheet.getCell(`B${rowIdx}`).font = { name: 'Arial', size: 10 };
    sheet.getCell(`G${rowIdx}`).font = { name: 'Arial', size: 10 };
    sheet.getCell(`B${rowIdx}`).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    sheet.getCell(`G${rowIdx}`).alignment = { horizontal: 'right', vertical: 'middle' };
    sheet.getRow(rowIdx).height = 18; // code row height
    currentRow++;
    // Inline details under the code row (like PDF)
    writeInlineDetails(r.id_code);
  });

  // Total row
  sheet.insertRow(currentRow, ['TOTAL', '', '', '', '', '', total]);
  ['A','B','C','D','E','F','G'].forEach((col) => {
    const cell = sheet.getCell(`${col}${currentRow}`);
    if (!cell.value) cell.value = '';
    cell.font = { bold: true, name: 'Arial' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF89A8B2' } };
    cell.alignment = { horizontal: (col === 'G' ? 'right' : 'left'), vertical: 'middle' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    };
  });
  sheet.getRow(currentRow).height = 18; // total row height
  sheet.getColumn(7).numFmt = '#,##0.00';

  // Optional: add details sheet
  if (includeDetails && detailsByCode && Object.keys(detailsByCode).length > 0) {
    const ds = workbook.addWorksheet('Détails annexes');
    ds.columns = [
      { header: 'Code', key: 'code', width: 10 },
      { header: 'Réf.', key: 'ref', width: 18 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Libellé', key: 'lib', width: 45 },
      { header: 'Montant HT', key: 'mht', width: 16 },
      { header: 'Montant TVA', key: 'mtva', width: 16 },
    ];
    // Title
    ds.insertRow(1, ['Détails des annexes (par code TVA)']);
    ds.mergeCells('A1:F1');
    const t = ds.getRow(1);
    t.font = { bold: true, size: 16, name: 'Arial' };
    t.alignment = { horizontal: 'center', vertical: 'middle' };
    t.height = 20;

    // Header values and styling on row 2
    ds.insertRow(2, ['Code', 'Réf.', 'Date', 'Libellé', 'Montant HT', 'Montant TVA']);
    const hdr = ds.getRow(2);
    hdr.eachCell((c) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } };
      c.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial' };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    let rowIdx = 3;
    const codes = Object.keys(detailsByCode).sort((a,b) => Number(a) - Number(b));
    for (const code of codes) {
      const list = detailsByCode[code] || [];
      if (!Array.isArray(list) || list.length === 0) continue;
      for (const d of list) {
        ds.insertRow(rowIdx, [
          String(code),
          d.reference_facture || '',
          d.date_facture ? String(d.date_facture).slice(0,10) : '',
          d.libelle_operation || '',
          Number(d.montant_ht || 0),
          Number(d.montant_tva || 0),
        ]);
        rowIdx++;
      }
    }
    ds.getColumn(5).numFmt = '#,##0.00';
    ds.getColumn(6).numFmt = '#,##0.00';
    // Freeze header
    ds.views = [{ state: 'frozen', ySplit: 2 }];
  }
};

module.exports = { exportFormulaireTvaExcel };