const generateFormulairePdfContent = ({ rows, mode, detailsByCode = {} }) => {
  const makeHeader = () => ([
    { text: 'Code', style: 'tableHeader' },
    { text: 'Libellé', style: 'tableHeader' },
    { text: 'Montant', style: 'tableHeader' },
  ]);

const fmt = (n) => {
  const num = typeof n === 'number' ? n : parseFloat(String(n).replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) return '0,00';
  const v = Math.round(num * 100) / 100;
  const parts = v.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${parts[0]},${parts[1]}`;
};

// Grouped rendering for DGE
  if (String(mode || '').toLowerCase() === 'dge') {const buildDetailsTable = (normCode) => {
  const list = detailsByCode && detailsByCode[normCode];
  if (!list || list.length === 0) return null;

    const headerStyle = {
    style: 'tableHeader',
    color: '#000000',         // couleur du texte
    fillColor: '#94c6ffff',     // fond bleu clair
    bold: true,
    fontSize: 8,
    name: 'Arial',
      
  };

  const head = [
    { text: 'Réf.', ...headerStyle },
    { text: 'Date', ...headerStyle },
    { text: 'Libellé', ...headerStyle },
    { text: 'HT', ...headerStyle },
    { text: 'TVA', ...headerStyle },
  ];

  const body = [head];
  let totHT = 0, totTVA = 0;

  for (const d of list) {
    const mht = Number(d.montant_ht || 0);
    const mtva = Number(d.montant_tva || 0);
    totHT += mht; totTVA += mtva;
    body.push([
      { text: String(d.reference_facture || ''), fontSize: 6 },
      { text: d.date_facture ? String(d.date_facture).slice(0,10) : '', fontSize: 6 },
      { text: String(d.libelle_operation || ''), fontSize: 6, noWrap: false },
      { text: fmt(mht), alignment: 'right', fontSize: 6 },
      { text: fmt(mtva), alignment: 'right', fontSize: 6 },
    ]);
  }

  body.push([
    { text: 'TOTAL DÉTAILS', bold: true,name: 'Arial', fillColor: '#F0F3F4', fontSize: 5 },
    { text: '', fillColor: '#F0F3F4' },
    { text: '', fillColor: '#F0F3F4' },
    { text: fmt(totHT), bold: true,name: 'Arial', alignment: 'right', fillColor: '#F0F3F4', fontSize: 5 },
    { text: fmt(totTVA), bold: true,name: 'Arial', alignment: 'right', fillColor: '#F0F3F4', fontSize: 5 },
  ]);

  return {
    table: { headerRows: 1, widths: ['*', '*', '*', '*', '*'], body },
    layout: {
      hLineWidth: (i, node) => {
        // Remove the line directly under the header
        if (i === 1) return 0;
        return 0.5;
      },
      hLineColor: () => '#E0E0E0',
      vLineWidth: () => 0,
    },
    margin: [0, 2, 0, 2], // moins d’espace vertical
  };
};

    const groups = [
      { code: '01', title: "01 DETERMINATION DU CHIFFRE D'AFFAIRES" },
      { code: '02', title: '02 TVA COLLECTEE' },
      { code: '03', title: '03 TVA DEDUCTIBLE' },
      { code: '04', title: '04 CREDITS ET REGULARISATION' },
      { code: '05', title: '05 SYNTHESE' },
    ];
    const content = [];
    let grandTotal = 0;
    groups.forEach(g => {
      const groupRows = (rows || []).filter(r => String(r.groupe || '') === g.code);
      if (!groupRows || groupRows.length === 0) return;
      // Section title
      content.push({
        text: g.title,
        margin: [0, 6, 0, 4],
        color: '#155724',
        background: '#d4edda',
        style: { bold: true, name: 'Arial' },
      });
      const body = [makeHeader()];
      let subtotal = 0;
      groupRows.forEach(r => {
        const montant = Number(r.montant || 0);
        subtotal += montant;
        grandTotal += montant;
        const codeStr = String(r.id_code || '');
        const normCode = codeStr ? String(Number(codeStr)) : '';
        body.push([
          { text: String(r.id_code || ''), alignment: 'center', fontSize: 7, name: 'Arial' },
          { text: r.libelle || '', alignment: 'left', noWrap: false, fontSize: 7, name: 'Arial' },
          { text: fmt(montant), alignment: 'right', fontSize: 7, name: 'Arial' },
        ]);
        const details = buildDetailsTable(normCode);
        if (details) {
          body.push([
            { text: '' },
            { margin: [0, 2, 0, 4], table: details.table, layout: details.layout },
            { text: '' },
          ]);
        }
      });
      content.push({ table: { headerRows: 1, widths: [30, '*', 60], body }, layout: 'lightHorizontalLines' });
    });
    // Grand total
    content.push({
      table: {
        headerRows: 0,
        widths: [30, '*', 60],
        body: [[
          { text: 'TOTAL', bold: true, fillColor: '#89A8B2', alignment: 'left', name: 'Arial' },
          { text: '', fillColor: '#89A8B2' },
          { text: fmt(grandTotal), bold: true, alignment: 'right', fillColor: '#89A8B2', name: 'Arial' },
        ]],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 6, 0, 0],
    });
    return content;
  }

  // Flat fallback (CFISC or default)
  const body = [makeHeader()];
  let total = 0;
  (rows || []).forEach(r => {
    const montant = Number(r.montant || 0);
    total += montant;
    const codeStr = String(r.id_code || '');
    const normCode = codeStr ? String(Number(codeStr)) : '';
    body.push([
      { text: String(r.id_code || ''), alignment: 'center', fontSize: 7, name: 'Arial' },
      { text: r.libelle || '', alignment: 'left', noWrap: false, fontSize: 7, name: 'Arial' },
      { text: fmt(montant), alignment: 'right', fontSize: 7, name: 'Arial' },
    ]);
    const details = buildDetailsTable(normCode);
    if (details) {
      body.push([
        { text: '' },
        { margin: [0, 2, 0, 4], table: details.table, layout: details.layout },
        { text: '' },
      ]);
    }
  });
  body.push([
    { text: 'TOTAL', bold: true, fillColor: '#89A8B2', alignment: 'left', name: 'Arial' },
    { text: '', fillColor: '#89A8B2' },
    { text: fmt(total), bold: true, alignment: 'right', fillColor: '#89A8B2', name: 'Arial' },
  ]);

  return [{ table: { headerRows: 1, widths: [30, '*', 60], body }, layout: 'lightHorizontalLines' }];
};

module.exports = { generateFormulairePdfContent };
