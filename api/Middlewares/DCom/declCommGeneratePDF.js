const db = require("../../Models");

const droitcommas = db.droitcommas;
const droitcommbs = db.droitcommbs;
const etatsplp = db.etatsplp;
const dossierplancomptable = db.dossierplancomptable;

const formatAmount = (value) => {
    if (value === null || value === undefined) return '';

    const absValue = Math.abs(Number(value));
    let str = absValue.toFixed(2);
    str = str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',');

    return Number(value) < 0 ? `- ${str}` : str;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [jour, mois, annee] = dateStr.split('-');

    return `${annee}/${mois.padStart(2, '0')}/${jour.padStart(2, '0')}`;
};

const getDroitCommData = async (id_compte, id_dossier, id_exercice, id_etat) => {
    if (['SVT', 'ADR', 'AC', 'AI', 'DEB'].includes(id_etat)) {
        const data = await droitcommas.findAll({
            where: {
                id_dossier,
                id_exercice,
                id_compte,
                type: id_etat,
            },
            include: [
                {
                    model: dossierplancomptable,
                    attributes: ['compte']
                }
            ],
            order: [['id', 'ASC'], ['typeTier', 'ASC']],
        })
        const mappedData = data.map((val) => {
            const { dossierplancomptable, ...rest } = val.toJSON();
            return {
                ...rest,
                compte: dossierplancomptable?.compte || null,
            };
        })
        return mappedData;
    } else if (['MV', 'PSV', 'PL'].includes(id_etat)) {
        const data = await droitcommbs.findAll({
            where: {
                id_dossier,
                id_exercice,
                id_compte,
                type: id_etat,
            },
            include: [
                {
                    model: dossierplancomptable,
                    attributes: ['compte']
                }
            ],
            order: [['id', 'ASC'], ['typeTier', 'ASC']],
        })
        const mappedData = data.map((val) => {
            const { dossierplancomptable, ...rest } = val.toJSON();
            return {
                ...rest,
                compte: dossierplancomptable?.compte || null,
            };
        })
        return mappedData;
    } else {
        return await etatsplp.findAll({
            where: {
                id_dossier,
                id_exercice,
                id_compte
            },
            order: [['id', 'ASC']],
        })
    }
}

const combineByIdNumcpt = (data) => {
    const map = new Map();

    data.forEach(item => {
        const key = item.id_numcpt;
        if (!map.has(key)) {
            map.set(key, { ...item });
        } else {
            map.get(key).comptabilisees += item.comptabilisees;
            map.get(key).versees += item.versees;
            map.get(key).montanth_tva += item.montanth_tva;
        }
    });

    return Array.from(map.values());
};

exports.generateDroitCommasContent = async (id_compte, id_dossier, id_exercice, id_etat) => {
    const data = await getDroitCommData(id_compte, id_dossier, id_exercice, id_etat);
    const dataCombined = combineByIdNumcpt(data);

    const buildTable = (data) => {
        const body = [];

        body.push([
            { text: 'Compte', style: 'tableHeader' },
            { text: 'NIF', style: 'tableHeader' },
            { text: 'Stat', style: 'tableHeader' },
            { text: 'CIN', style: 'tableHeader' },
            { text: 'NIF Repr', style: 'tableHeader' },
            { text: 'Raison sociale', style: 'tableHeader' },
            { text: 'Adresse', style: 'tableHeader' },
            { text: 'Ville', style: 'tableHeader' },
            { text: 'Ex-Province', style: 'tableHeader' },
            { text: 'Comptabilisés', style: 'tableHeader', alignment: 'right' },
            { text: 'Versés', style: 'tableHeader', alignment: 'right' }
        ]);
        let totalComptabilises = 0;
        let totalVerses = 0;

        dataCombined.forEach(row => {
            totalComptabilises += parseFloat(row.comptabilisees) || 0;
            totalVerses += parseFloat(row.versees) || 0;
            body.push([
                {
                    text: row.compte || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.nif || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.num_stat || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.cin || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.nif_representaires || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.raison_sociale || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.adresse || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.ville || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.ex_province || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: formatAmount(row.comptabilisees),
                    alignment: 'right',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: formatAmount(row.versees),
                    alignment: 'right',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                }
            ]);
        });

        body.push([
            {
                text: 'TOTAL',
                bold: true,
                alignment: 'left',
                margin: [0, 2, 0, 2],
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: formatAmount(totalComptabilises),
                bold: true,
                alignment: 'right',
                margin: [0, 2, 0, 2],
                fillColor: '#89A8B2',
            },
            {
                text: formatAmount(totalVerses),
                bold: true,
                alignment: 'right',
                margin: [0, 2, 0, 2],
                fillColor: '#89A8B2',
            }
        ]);

        return [
            {
                table: {
                    headerRows: 1,
                    widths: ['7%', '9,09%', '9,09%', '9,09%', '9,09%', '9,09%', '9,09%', '9,09%', '9,09%', '9,09%', '11,09%'],
                    body
                },
                layout: 'lightHorizontalLines'
            }
        ];
    };

    return {
        buildTable,
        dataCombined
    }

    // return dataCombined;
}

exports.generateDroitCommbsContent = async (id_compte, id_dossier, id_exercice, id_etat) => {
    const data = await getDroitCommData(id_compte, id_dossier, id_exercice, id_etat);
    const dataCombined = combineByIdNumcpt(data);
    const buildTable = (data) => {
        const body = [];

        body.push([
            { text: 'Compte', style: 'tableHeader' },
            { text: 'NIF', style: 'tableHeader' },
            { text: 'Stat', style: 'tableHeader' },
            { text: 'CIN', style: 'tableHeader' },
            { text: 'NIF Repr', style: 'tableHeader' },
            { text: 'Raison sociale', style: 'tableHeader' },
            { text: 'Adresse', style: 'tableHeader' },
            { text: 'Ville', style: 'tableHeader' },
            { text: 'Ex-Province', style: 'tableHeader' },
            { text: 'Payement', style: 'tableHeader' },
            { text: 'Montants HT', style: 'tableHeader', alignment: 'right' },
        ]);
        let totalHT = 0;

        dataCombined.forEach(row => {
            totalHT += parseFloat(row.montanth_tva) || 0;
            body.push([
                {
                    text: row.compte || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.nif || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.num_stat || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.cin || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.nif_representaires || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.raison_sociale || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.adresse || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.ville || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.ex_province || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.mode_payement || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: formatAmount(row.montanth_tva),
                    alignment: 'right',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
            ]);
        });

        body.push([
            {
                text: 'TOTAL',
                bold: true,
                alignment: 'left',
                margin: [0, 2, 0, 2],
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: formatAmount(totalHT),
                bold: true,
                alignment: 'right',
                margin: [0, 2, 0, 2],
                fillColor: '#89A8B2',
            },
        ]);

        return [
            {
                table: {
                    headerRows: 1,
                    widths: ['7%', '9,09%', '9,09%', '9,09%', '9,09%', '9,09%', '9,09%', '9,09%', '9,09%', '9,09%', '11,09%'],
                    body
                },
                layout: 'lightHorizontalLines'
            }
        ];
    };

    return {
        buildTable,
        dataCombined
    }
}

exports.generateDroitCommPlp = async (id_compte, id_dossier, id_exercice, id_etat) => {
    const data = await getDroitCommData(id_compte, id_dossier, id_exercice, id_etat);
    const buildTable = (data) => {
        const body = [];

        body.push([
            { text: 'Code', style: 'tableHeader' },
            { text: 'Nature', style: 'tableHeader' },
            { text: 'Unité', style: 'tableHeader' },
            { text: 'Commercant quantité', style: 'tableHeader', alignment: 'right' },
            { text: 'Commercant valeur', style: 'tableHeader', alignment: 'right' },
            { text: 'Producteur quantité', style: 'tableHeader', alignment: 'right' },
            { text: 'Producteur valeur', style: 'tableHeader', alignment: 'right' },
        ]);

        let totalValCommercant = 0;
        let totalValProducteur = 0;

        data.forEach(row => {
            totalValCommercant += parseFloat(row.commercant_valeur) || 0;
            totalValProducteur += parseFloat(row.producteur_valeur) || 0;
            body.push([
                {
                    text: row.code_cn || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.nature_produit || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: row.unite_quantite || '',
                    alignment: 'left',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: formatAmount(row.commercant_quantite),
                    alignment: 'right',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: formatAmount(row.commercant_valeur),
                    alignment: 'right',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: formatAmount(row.producteur_quantite),
                    alignment: 'right',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
                {
                    text: formatAmount(row.producteur_valeur),
                    alignment: 'right',
                    valign: 'middle',
                    margin: [0, 2, 0, 2]
                },
            ]);
        });

        body.push([
            {
                text: 'TOTAL',
                bold: true,
                alignment: 'left',
                margin: [0, 2, 0, 2],
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: formatAmount(totalValCommercant),
                bold: true,
                alignment: 'right',
                margin: [0, 2, 0, 2],
                fillColor: '#89A8B2',
            },
            {
                text: '',
                fillColor: '#89A8B2',
            },
            {
                text: formatAmount(totalValProducteur),
                bold: true,
                alignment: 'right',
                margin: [0, 2, 0, 2],
                fillColor: '#89A8B2',
            },
        ]);

        return [
            {
                table: {
                    headerRows: 1,
                    widths: ['8,28%', '31,28%', '7,28%', '12,28%', '14,28%', '12,28%', '14,28%'],
                    body
                },
                layout: 'lightHorizontalLines'
            }
        ];
    };

    return {
        buildTable,
        data
    }
}