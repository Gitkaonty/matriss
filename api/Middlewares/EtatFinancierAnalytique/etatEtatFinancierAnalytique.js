const db = require("../../Models");
const etatsEtatFinancierMatrice = db.etatsEtatFinancierMatrice;
const etatsEtatFinancierAnalitiques = db.etatsEtatFinancierAnalitiques;

const createEtatsEtatFinancierAnalytiqueIfNotExist = async (id_dossier, id_compte, id_exercice, id_etat) => {
    try {
        const etatData = await etatsEtatFinancierMatrice.findOne({
            where: { code: id_etat }
        });

        if (!etatData) return { created: false, reason: "Etat matrice introuvable" };

        const exist = await etatsEtatFinancierAnalitiques.findOne({
            where: { id_compte, id_dossier, id_exercice, code: id_etat }
        });

        if (exist) return { created: false, reason: "Déjà existant" };

        const created = await etatsEtatFinancierAnalitiques.create({
            id_compte,
            id_dossier,
            id_exercice,
            code: etatData.code,
            nom: etatData.nom,
            ordre: etatData.ordre,
            valide: etatData.valide
        });

        return { created: true, data: created };

    } catch (err) {
        console.error("Erreur création état analytique :", err);
        throw err;
    }
};

module.exports = {
    createEtatsEtatFinancierAnalytiqueIfNotExist
}