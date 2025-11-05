const db = require("../../Models");
const rubriquesExternes = db.rubriquesExternes;
const rubriqueExternesEvcp = db.rubriqueExternesEvcp;

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [jour, mois, annee] = dateStr.split('-');

    return `${annee}/${mois.padStart(2, '0')}/${jour.padStart(2, '0')}`;
};

const generateTitle = (sheetName, label, dossier, compte, date_debut, date_fin, cellEnd) => {
    sheetName.insertRow(1, [
        label
    ])

    sheetName.insertRow(2, [
        `Dossier : ${dossier}\nPériode du : ${date_debut} au ${date_fin}`
    ]);

    sheetName.mergeCells(`A1:${cellEnd}1`);
    sheetName.mergeCells(`A2:${cellEnd}2`)

    const titreTftd = sheetName.getRow(1);
    titreTftd.font = { bold: true, size: 20 };
    titreTftd.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
    };
    titreTftd.height = 25;

    const sousTitreTftd = sheetName.getRow(2);

    sousTitreTftd.font = { bold: true, size: 12 };
    sousTitreTftd.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true
    };
    sousTitreTftd.height = 40;
}

const getRubriqueExterneData = async (id_compte, id_dossier, id_exercice, id_etat) => {
    return rubriquesExternes.findAll({
        where: {
            id_dossier,
            id_exercice,
            id_compte,
            id_etat,
        },
        order: [['ordre', 'ASC']]
    })
}

const exportBilanToExcel = async (id_compte, id_dossier, id_exercice, workbook, dossier, compte, date_debut, date_fin) => {
    const bilanActifData = await getRubriqueExterneData(id_compte, id_dossier, id_exercice, 'BILAN_ACTIF');
    const bilanPassifData = await getRubriqueExterneData(id_compte, id_dossier, id_exercice, 'BILAN_PASSIF');

    // Feuille Actif
    const sheetActif = workbook.addWorksheet('Bilan Actif');
    // sheetActif.views = [
    //     { state: 'frozen', ySplit: 1 }
    // ];
    sheetActif.columns = [
        { header: 'Actif', width: 45 },
        { header: 'Montant brut', width: 20 },
        { header: 'Amort./Perte val.', width: 20 },
        { header: 'Montant net N', width: 20 },
        { header: 'Montant net N-1', width: 20 }
    ];

    generateTitle(sheetActif, 'Liste des Bilan actif', dossier, compte, date_debut, date_fin, 'E');

    const headerActif = sheetActif.getRow(3);
    headerActif.eachCell((cell, colNumber) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1A5276' }
        };
        cell.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' }
        };
        if (colNumber === 3 || colNumber === 4 || colNumber === 5 || colNumber === 6) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else {
            cell.alignment = { vertical: 'middle' };
        }
    });

    bilanActifData.forEach(row => {
        const isTitre = row.type === 'TITRE';
        const isTotal = row.type === 'TOTAL';
        const isSousTotal = row.type === 'SOUS-TOTAL';
        const bgColor = isTotal ? '89A8B2' : isTitre ? 'f0f0f0' : isSousTotal ? '9bc2cf' : null;

        const newRow = sheetActif.addRow([
            row.libelle || '',
            isTitre ? '' : Number(row.montantbrut),
            isTitre ? '' : Number(row.montantamort),
            isTitre ? '' : Number(row.montantnet),
            isTitre ? '' : Number(row.montantnetn1)
        ]);

        // Appliquer la couleur de fond
        if (bgColor) {
            newRow.eachCell((cell, colNumber) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor }
                };
            });
        }
    });

    for (let i = 2; i <= 5; i++) {
        sheetActif.getColumn(i).numFmt = '#,##0.00';
    }

    // Feuille Passif
    const sheetPassif = workbook.addWorksheet('Bilan Passif');
    // sheetPassif.views = [
    //     { state: 'frozen', ySplit: 1 }
    // ];
    sheetPassif.columns = [
        { header: 'Capitaux propres', width: 60 },
        { header: 'Montant N', width: 20 },
        { header: 'Montant N-1', width: 20 }
    ];

    generateTitle(sheetPassif, 'Liste des Bilan passif', dossier, compte, date_debut, date_fin, 'C');

    const headerPassif = sheetPassif.getRow(3);
    headerPassif.eachCell((cell, colNumber) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1A5276' }
        };
        cell.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' }
        };
        if (colNumber === 3 || colNumber === 4) {
            cell.alignment = { horizontal: 'right', vertical: 'middle' };
        } else {
            cell.alignment = { vertical: 'middle' };
        }
    });

    for (let i = 1; i <= 2; i++) {
        sheetPassif.getColumn(i).numFmt = '#,##0.00';
    }

    bilanPassifData.forEach(row => {
        const isTitre = row.type === 'TITRE';
        const isTotal = row.type === 'TOTAL';
        const isSousTotal = row.type === 'SOUS-TOTAL';
        const bgColor = isTotal ? '89A8B2' : isTitre ? 'f0f0f0' : isSousTotal ? '9bc2cf' : null;

        const newRow = sheetPassif.addRow([
            row.libelle || '',
            isTitre ? '' : Number(row.montantnet),
            isTitre ? '' : Number(row.montantnetn1)
        ]);

        // Appliquer la couleur de fond
        if (bgColor) {
            newRow.eachCell((cell, colNumber) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor }
                };
            });
        }
    });
}

const exportCrnToExcel = async (id_compte, id_dossier, id_exercice, workbook, dossier, compte, date_debut, date_fin) => {
    const crnData = await getRubriqueExterneData(id_compte, id_dossier, id_exercice, 'CRN');
    const sheetCrn = workbook.addWorksheet('Compte de résultats par nature');
    // sheetCrn.views = [
    //     { state: 'frozen', ySplit: 1 }
    // ];
    sheetCrn.columns = [
        { header: 'Rubriques', width: 60 },
        { header: 'Montant net N', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } },
        { header: 'Montant net N-1', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } }
    ];

    generateTitle(sheetCrn, 'Liste des compte de résultats par fonction', dossier, compte, date_debut, date_fin, 'C');

    const headerCrn = sheetCrn.getRow(3);
    headerCrn.eachCell((cell, colNumber) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1A5276' }
        };
        cell.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' }
        };
    });

    crnData.forEach(row => {
        const isTitre = row.type === 'TITRE';
        const isTotal = row.type === 'TOTAL';
        const isSousTotal = row.type === 'SOUS-TOTAL';
        const bgColor = isTotal ? '89A8B2' : isTitre ? 'f0f0f0' : isSousTotal ? '9bc2cf' : null;

        const newRow = sheetCrn.addRow([
            row.libelle || '',
            isTitre ? '' : Number(row.montantnet) || 0,
            isTitre ? '' : Number(row.montantnetn1) || 0
        ]);

        // Appliquer la couleur de fond
        if (bgColor) {
            newRow.eachCell((cell, colNumber) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor }
                };
            });
        }
    });

    for (let i = 1; i <= 2; i++) {
        sheetCrn.getColumn(i).numFmt = '#,##0.00';
    }
}

const exportCrfToExcel = async (id_compte, id_dossier, id_exercice, workbook, dossier, compte, date_debut, date_fin) => {
    const crfData = await getRubriqueExterneData(id_compte, id_dossier, id_exercice, 'CRF');
    const sheetCrf = workbook.addWorksheet('Compte de résultats par fonction');
    // sheetCrf.views = [
    //     { state: 'frozen', ySplit: 1 }
    // ];
    sheetCrf.columns = [
        { header: 'Rubriques', width: 60 },
        { header: 'Montant net N', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } },
        { header: 'Montant net N-1', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } }
    ];

    generateTitle(sheetCrf, 'Liste des compte de résultats par fonction', dossier, compte, date_debut, date_fin, 'C');

    const headerCrf = sheetCrf.getRow(3);
    headerCrf.eachCell((cell, colNumber) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1A5276' }
        };
        cell.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' }
        };
    });

    crfData.forEach(row => {
        const isTitre = row.type === 'TITRE';
        const isTotal = row.type === 'TOTAL';
        const isSousTotal = row.type === 'SOUS-TOTAL';
        const bgColor = isTotal ? '89A8B2' : isTitre ? 'f0f0f0' : isSousTotal ? '9bc2cf' : null;

        const newRow = sheetCrf.addRow([
            row.libelle || '',
            isTitre ? '' : Number(row.montantnet) || 0,
            isTitre ? '' : Number(row.montantnetn1) || 0
        ]);

        // Appliquer la couleur de fond
        if (bgColor) {
            newRow.eachCell((cell, colNumber) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor }
                };
            });
        }
    });

    for (let i = 1; i <= 2; i++) {
        sheetCrf.getColumn(i).numFmt = '#,##0.00';
    }
}

const exportTftiToExcel = async (id_compte, id_dossier, id_exercice, workbook, dossier, compte, date_debut, date_fin) => {
    const tftiData = await getRubriqueExterneData(id_compte, id_dossier, id_exercice, 'TFTI');
    const sheetTfti = workbook.addWorksheet('TFTI Méth. Indirecte');

    // Colonnes avec alignement par défaut
    sheetTfti.columns = [
        { header: 'Rubriques', width: 72, style: { alignment: { horizontal: 'left', vertical: 'middle' } } },
        { header: 'Montant net N', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } },
        { header: 'Montant net N-1', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } }
    ];

    generateTitle(sheetTfti, 'Liste des Tableau de flux de trésoreries méthode indirecte', dossier, compte, date_debut, date_fin, 'C');

    // Style de l'entête
    const headerRow = sheetTfti.getRow(3);
    headerRow.eachCell((cell, colNumber) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1A5276' }
        };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    // Ajout des lignes
    tftiData.forEach(row => {
        const isTitre = row.type === 'TITRE';
        const isTotal = row.type === 'TOTAL';
        const isSousTotal = row.type === 'SOUS-TOTAL';
        const bgColor = isTotal ? '89A8B2' : isTitre ? 'f0f0f0' : isSousTotal ? '9bc2cf' : null;

        const newRow = sheetTfti.addRow([
            row.libelle || '',
            isTitre ? '' : Number(row.montantnet) || 0,
            isTitre ? '' : Number(row.montantnetn1) || 0
        ]);

        // Appliquer la couleur de fond
        if (bgColor) {
            newRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor }
                };
            });
        }
    });

    // Format numérique pour les montants
    sheetTfti.getColumn(1).numFmt = '#,##0.00';
    sheetTfti.getColumn(2).numFmt = '#,##0.00';
}

const exportTftdToExcel = async (id_compte, id_dossier, id_exercice, workbook, dossier, compte, date_debut, date_fin) => {
    const tftdData = await getRubriqueExterneData(id_compte, id_dossier, id_exercice, 'TFTD');
    const sheetTftd = workbook.addWorksheet('TFTD Méth. Directe');
    // sheetTftd.views = [{ state: 'frozen', ySplit: 1 }];

    // Colonnes avec alignement par défaut
    sheetTftd.columns = [
        { header: 'Rubriques', width: 72, style: { alignment: { horizontal: 'left', vertical: 'middle' } } },
        { header: 'Montant net N', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } },
        { header: 'Montant net N-1', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } }
    ];

    generateTitle(sheetTftd, 'Liste des Tableau de flux de trésoreries méthode directe', dossier, compte, date_debut, date_fin, 'D');

    // Style de l'entête
    const headerRow = sheetTftd.getRow(3);
    headerRow.eachCell((cell, colNumber) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1A5276' }
        };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    // Ajout des lignes
    tftdData.forEach(row => {
        const isTitre = row.type === 'TITRE';
        const isTotal = row.type === 'TOTAL';
        const isSousTotal = row.type === 'SOUS-TOTAL';
        const bgColor = isTotal ? '89A8B2' : isTitre ? 'f0f0f0' : isSousTotal ? '9bc2cf' : null;

        const newRow = sheetTftd.addRow([
            row.libelle || '',
            isTitre ? '' : Number(row.montantnet) || 0,
            isTitre ? '' : Number(row.montantnetn1) || 0
        ]);

        // Appliquer la couleur de fond
        if (bgColor) {
            newRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor }
                };
            });
        }
    });

    // Format numérique pour les montants
    sheetTftd.getColumn(1).numFmt = '#,##0.00';
    sheetTftd.getColumn(2).numFmt = '#,##0.00';
}

const exportEvcpToExcel = async (id_compte, id_dossier, id_exercice, workbook, dossier, compte, date_debut, date_fin) => {
    const evcpData = await rubriqueExternesEvcp.findAll({
        where: {
            id_compte,
            id_dossier,
            id_exercice
        }
    })
    const sheetEvcp = workbook.addWorksheet('Etat de variation des capitaux propres');
    // sheetEvcp.views = [{ state: 'frozen', ySplit: 1 }];

    // Colonnes avec alignement par défaut
    sheetEvcp.columns = [
        { header: 'Rubriques', width: 50, style: { alignment: { horizontal: 'left', vertical: 'middle' } } },
        { header: 'Note', width: 12, style: { alignment: { horizontal: 'left', vertical: 'middle' } } },
        { header: 'Capital social', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } },
        { header: 'Capital prime & res', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } },
        { header: 'Ecart d\'évaluation', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } },
        { header: 'Résultat', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } },
        { header: 'Report à nouveau', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } },
        { header: 'Total', width: 20, style: { alignment: { horizontal: 'right', vertical: 'middle' } } }
    ];

    generateTitle(sheetEvcp, 'Liste des Etat de variation des capitaux propres', dossier, compte, date_debut, date_fin, 'H');

    // Style de l'entête
    const headerRow = sheetEvcp.getRow(3);
    headerRow.eachCell((cell, colNumber) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1A5276' }
        };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    // Ajout des lignes
    evcpData.forEach(row => {
        const isLevel1 = row.niveau === 1;
        const bgColor = isLevel1 ? 'f0f0f0' : null;

        const newRow = sheetEvcp.addRow([
            row.rubriquesmatrix?.libelle || '',
            row.note || '',
            Number(row.capitalsocial) || 0,
            Number(row.primereserve) || 0,
            Number(row.ecartdevaluation) || 0,
            Number(row.resultat) || 0,
            Number(row.report_anouveau) || 0,
            Number(row.total_varcap) || 0
        ]);

        // Appliquer la couleur de fond
        if (bgColor) {
            newRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor }
                };
            });
        }
    });

    // Format numérique pour les montants
    sheetEvcp.getColumn(3).numFmt = '#,##0.00';
    sheetEvcp.getColumn(4).numFmt = '#,##0.00';
    sheetEvcp.getColumn(5).numFmt = '#,##0.00';
    sheetEvcp.getColumn(6).numFmt = '#,##0.00';
    sheetEvcp.getColumn(7).numFmt = '#,##0.00';
    sheetEvcp.getColumn(8).numFmt = '#,##0.00';
}

module.exports = {
    exportBilanToExcel,
    exportCrnToExcel,
    exportCrfToExcel,
    exportTftiToExcel,
    exportTftdToExcel,
    exportEvcpToExcel
}