const db = require('../../Models');
const ExcelJS = require('exceljs');
const Irsa = db.irsa;

const exportIrsaTableExcel = async (id_compte, id_dossier, id_exercice, mois, annee, workbook, nomDossier, nomCompte, nomMois, dateDebut, dateFin) => {
    // Récupérer les données IRSA
    const irsaData = await Irsa.findAll({
        where: {
            id_compte,
            id_dossier,
            id_exercice,
            mois: Number(mois),
            annee: Number(annee)
        }
    });

    // Créer une nouvelle feuille
    const sheetIrsa = workbook.addWorksheet(`IRSA ${nomMois} ${annee}`);

    // Colonnes IRSA
    sheetIrsa.columns = [
        { header: 'Nom', width: 15 },
        { header: 'Prénom', width: 15 },
        { header: 'CIN', width: 15 },
        { header: 'CNAPS', width: 15 },
        { header: 'Fonction', width: 20 },
        { header: 'Date Entrée', width: 12 },
        { header: 'Date Sortie', width: 12 },
        { header: 'Salaire Base', width: 15 },
        { header: 'Heures Supp', width: 15 },
        { header: 'Prime/Gratification', width: 18 },
        { header: 'Autres', width: 15 },
        { header: 'Salaire Brut', width: 15 },
        { header: 'CNAPS Retenu', width: 15 },
        { header: 'Org. Santé', width: 15 },
        { header: 'Salaire Net', width: 15 },
        { header: 'Autre Déduction', width: 18 },
        { header: 'Montant Imposable', width: 18 },
        { header: 'Impôt Corr.', width: 18 },
        { header: 'Réd. Charge Fam.', width: 20 },
        { header: 'Impôt Dû', width: 15 },
        { header: 'Mois', width: 8 },
        { header: 'Année', width: 8 }
    ];

    // Title row
    sheetIrsa.insertRow(1, ['DÉCLARATION IRSA']);
    sheetIrsa.mergeCells('A1:V1');
    const titre = sheetIrsa.getRow(1);
    titre.font = { bold: true, size: 20 };
    titre.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    titre.height = 25;

    // Subtitle row
    sheetIrsa.insertRow(2, [`Dossier : ${nomDossier}\nCompte : ${nomCompte}\nMois et année : ${nomMois} ${annee}\nExercice du : ${dateDebut} au ${dateFin}`]);
    sheetIrsa.mergeCells('A2:V2');
    const sousTitre = sheetIrsa.getRow(2);
    sousTitre.font = { bold: true, size: 12 };
    sousTitre.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    sousTitre.height = 70;

    // Header row (row 3)
    const headerRow = sheetIrsa.getRow(3);
    headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Fonction formatage date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return String(dateString);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    // Totaux
    const totals = Array(13).fill(0); // colonnes de 8 à 20 = 13 totaux

    // Lignes de données
    irsaData.forEach(row => {
        const dataRow = sheetIrsa.addRow([
            row.nom || '',
            row.prenom || '',
            row.cin || '',
            row.cnaps || '',
            row.fonction || '',
            formatDate(row.dateEntree),
            formatDate(row.dateSortie),
            parseFloat(row.salaireBase) || 0,
            parseFloat(row.heuresSupp) || 0,
            parseFloat(row.primeGratification) || 0,
            parseFloat(row.autres) || 0,
            parseFloat(row.salaireBrut) || 0,
            parseFloat(row.cnapsRetenu) || 0,
            parseFloat(row.ostie) || 0,
            parseFloat(row.salaireNet) || 0,
            parseFloat(row.autreDeduction) || 0,
            parseFloat(row.montantImposable) || 0,
            parseFloat(row.impotCorrespondant) || 0,
            parseFloat(row.reductionChargeFamille) || 0,
            parseFloat(row.impotDu) || 0,
            row.mois || Number(mois),
            row.annee || Number(annee)
        ]);

        // Cumuler les totaux
        for (let i = 0; i < 13; i++) {
            totals[i] += dataRow.getCell(i + 8).value || 0;
        }

        // Format des montants
        for (let i = 8; i <= 20; i++) {
            const cell = dataRow.getCell(i);
            cell.numFmt = '#,##0.00';
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
    });

    // Ligne Total
    const totalRow = sheetIrsa.addRow([
        'TOTAL', '', '', '', '', '', '',
        ...totals,
        '', '' // Mois, Année
    ]);
    totalRow.font = { bold: true };
    totalRow.eachCell((cell, colNumber) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF89A8B2' } };
        cell.alignment = colNumber < 8 ? { horizontal: 'left', vertical: 'middle' } : { horizontal: 'right', vertical: 'middle' };
    });

    sheetIrsa.mergeCells(`A${totalRow.number}:G${totalRow.number}`);

    return workbook;
};

module.exports = { exportIrsaTableExcel };
