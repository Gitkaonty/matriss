const db = require('../../Models');
const { Op } = require('sequelize');

const Dossier = db.dossiers;
const Annex = db.etatsTvaAnnexes;

const generateTvaXml = async (id_compte, id_dossier, id_exercice, mois, annee, nif) => {
    // Récupérer les données TVA
    const annexes = await Annex.findAll({
        where: {
            id_compte,
            id_dossier,
            id_exercice,
            mois: Number(mois),
            annee: Number(annee)
        }
    });

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return String(dateString);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const formatValue = (value) => {
        if (value === null || value === undefined || value === '') return '';
        if (typeof value === 'number') return value.toString();
        return String(value);
    };

    const createChamp = (code, valeur) => {
        return `<champ>\n<code>${code}</code>\n<valeur>${formatValue(valeur)}</valeur>\n</champ>`;
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<EDI>\n<informations>\n<type>TVA</type>\n<ncc>${nif}</ncc>\n<codeTaxe>TVA</codeTaxe>\n<mois>${mois}</mois>\n<exercice>${annee}</exercice>\n</informations>\n<tableaux>\n<tableau>\n<donnees>`;

    annexes.forEach((row) => {
        xml += `\n<ligne>`;
        const champs = [
            { code: 'COLLECTE_DEDUCTIBLE', valeur: row.collecte_deductible || row.type_tva || '' },
            { code: 'LOCAL_ETRANGER', valeur: row.local_etranger || row.origine || '' },
            { code: 'NIF', valeur: row.nif || '' },
            { code: 'RAISON_SOCIALE', valeur: row.raison_sociale || '' },
            { code: 'STAT', valeur: row.stat || '' },
            { code: 'ADRESSE', valeur: row.adresse || '' },
            { code: 'MONTANT_HT', valeur: row.montant_ht || 0 },
            { code: 'MONTANT_TVA', valeur: row.montant_tva || 0 },
            { code: 'REFERENCE_FACTURE', valeur: row.reference_facture || '' },
            { code: 'DATE_FACTURE', valeur: formatDate(row.date_facture) },
            { code: 'NATURE', valeur: row.nature || '' },
            { code: 'LIBELLE_OPERATION', valeur: row.libelle_operation || '' },
            { code: 'DATE_PAIEMENT', valeur: formatDate(row.date_paiement) },
            { code: 'MOIS', valeur: row.mois || Number(mois) },
            { code: 'ANNEE', valeur: row.annee || Number(annee) },
            { code: 'OBSERVATION', valeur: row.observation || '' },
            { code: 'N_DAU', valeur: row.n_dau || '' },
            { code: 'LIGNE_FORMULAIRE', valeur: row.ligne_formulaire || '' },
            { code: 'CODE_TVA', valeur: row.code_tva || row.code || '' },
        ];
        champs.forEach((c) => {
            xml += `\n${createChamp(c.code, c.valeur)}`;
        });
        xml += `\n</ligne>`;
    });

    xml += `\n</donnees>\n</tableau>\n</tableaux>\n</EDI>`;

    return xml;
};

module.exports = { generateTvaXml };
