const db = require("../../Models");
const isis = db.isi;

const formatDate = (dateStr) => {
    if (!dateStr) return '';

    const d = new Date(dateStr);

    if (isNaN(d)) return '';

    const jour = String(d.getDate()).padStart(2, '0');
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const annee = d.getFullYear();

    return `${jour}/${mois}/${annee}`;
};

const generateTitle = (sheetName, label, dossier, compte, moisNoms, annee, date_debut, date_fin, cellEnd) => {
    sheetName.insertRow(1, [
        label
    ])

    sheetName.insertRow(2, [
        `Dossier : ${dossier}\nCompte : ${compte}\nMois et année : ${moisNoms} ${annee}\nExercice du : ${date_debut} au ${date_fin}`
    ]);

    sheetName.mergeCells(`A1:${cellEnd}1`);
    sheetName.mergeCells(`A2:${cellEnd}2`)

    const titre = sheetName.getRow(1);
    titre.font = { bold: true, size: 20 };
    titre.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
    };
    titre.height = 25;

    const sousTitre = sheetName.getRow(2);

    sousTitre.font = { bold: true, size: 12 };
    sousTitre.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true
    };
    sousTitre.height = 70;
}

const exportISIToExcel = async (id_compte, id_dossier, id_exercice, mois, annee, workbook, dossier, compte, moisNoms, date_debut, date_fin) => {
    const isi = await isis.findAll({
        where: {
            id_compte,
            id_dossier,
            id_exercice,
            declisimois: mois,
            declisiannee: annee
        }
    })

    const sheetISI = workbook.addWorksheet('Liste des déclarations ISI');

    sheetISI.columns = [
        { header: 'Nom', width: 35 },
        { header: 'CIN', width: 20 },
        { header: 'Nature', width: 15 },
        { header: 'Date', width: 13 },
        { header: 'Province', width: 30 },
        { header: 'Région', width: 30 },
        { header: 'Commune', width: 30 },
        { header: 'Fokontany', width: 30 },
        { header: 'Montant transaction', width: 23 },
        { header: 'Montant ISI', width: 23 },
    ];

    generateTitle(sheetISI, 'Liste des déclarations ISI', dossier, compte, moisNoms, annee, date_debut, date_fin, 'J');

    const headerRow = sheetISI.getRow(3);
    headerRow.eachCell(cell => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1A5276' }
        };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    let totalTransaction = 0;
    let totalIsi = 0;

    // Ajout des lignes
    isi.forEach(row => {
        totalTransaction += parseFloat(row.montant_transaction) || 0;
        totalIsi += parseFloat(row.montant_isi) || 0;
        sheetISI.addRow([
            row.nom || '',
            row.cin || '',
            row.nature || '',
            formatDate(row.date_transaction) || '',
            row.province || '',
            row.region || '',
            row.commune || '',
            row.fokontany || '',
            Number(row.montant_transaction) || 0,
            Number(row.montant_isi) || 0
        ]);
    });

    // Ligne Total
    const totalRow = sheetISI.addRow([
        'Total',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        Number(totalTransaction) || 0,
        Number(totalIsi) || 0
    ]);

    // Style du total
    totalRow.font = { bold: true };
    totalRow.eachCell((cell, colNumber) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '89A8B2' }
        };
        if (colNumber === 1) {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
        } else {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
    });

    // Fusionner les cellules 1 à 8 pour le label "Total"
    sheetISI.mergeCells(`A${totalRow.number}:H${totalRow.number}`);

    // Format numérique pour les montants (col 9 et 10)
    sheetISI.getColumn(9).numFmt = '#,##0.00';
    sheetISI.getColumn(10).numFmt = '#,##0.00';
};

module.exports = {
    exportISIToExcel
}