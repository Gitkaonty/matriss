require('dotenv').config();
const db = require("../../../Models");

const consolidationDossier = db.consolidationDossier;
const consolidationCompte = db.consolidationCompte;
const dossiers = db.dossiers;
const dossierPlanComptable = db.dossierplancomptable;

exports.getListeConsolidationDossier = async (req, res) => {
    try {
        const { id_compte, id_dossier } = req.params;
        if (!id_dossier || !id_compte) return res.status(409).json({ message: 'Données manquantes', state: false });

        const consolidationDossierData = (await consolidationDossier.findAll({
            where: {
                id_dossier,
                id_compte
            },
            include: [
                { model: dossiers, attributes: ['dossier'], as: 'dossierAutre' },
            ]
        })).map((r) => {
            const consolidation = r.toJSON();

            consolidation.id = Number(consolidation.id);
            consolidation.id_compte = Number(consolidation.id_compte);
            consolidation.id_dossier = Number(consolidation.id_dossier);
            consolidation.id_dossier_autre = Number(consolidation.id_dossier_autre);
            consolidation.dossier_autre = consolidation.dossierAutre.dossier;
            const { dossierAutre, ...filteredData } = consolidation;
            return filteredData;
        })
        return res.status(200).json({
            message: "Consolidation dossier reçus avec succès",
            state: true,
            list: consolidationDossierData
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.addOrUpdateConsolidationDossier = async (req, res) => {
    try {
        const { idCompte, idConsolidation, idDossier, idDossierAutre } = req.body;

        if (!idCompte || !idDossier || !idDossierAutre) {
            return res.status(400).json({
                state: false,
                msg: 'Champs obligatoires manquants'
            });
        }

        const id_compte = Number(idCompte);
        const id_dossier = Number(idDossier);
        const id_dossier_autre = Number(idDossierAutre);
        const id_consolidation = Number(idConsolidation);

        if ([id_compte, id_dossier, id_dossier_autre].some(isNaN)) {
            return res.status(400).json({
                state: false,
                msg: "Identifiants invalides"
            });
        }

        let resData = { state: false, msg: '' };

        if (!id_consolidation || id_consolidation <= 0) {
            await consolidationDossier.create({
                id_compte,
                id_dossier,
                id_dossier_autre
            });

            resData.state = true;
            resData.msg = "Nouvelle ligne sauvegardée avec succès.";
        }
        else {
            const exist = await consolidationDossier.findOne({
                where: {
                    id: id_consolidation,
                    id_compte,
                    id_dossier
                }
            });

            if (!exist) {
                return res.status(404).json({
                    state: false,
                    msg: "Consolidation introuvable"
                });
            }

            await consolidationDossier.update(
                { id_dossier_autre },
                { where: { id: id_consolidation } }
            );

            resData.state = true;
            resData.msg = "Modification effectuée avec succès.";
        }

        return res.json(resData);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            state: false,
            msg: "Erreur serveur",
            error: error.message
        });
    }
};

exports.deleteConsolidation = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                state: false,
                message: "Id manquante"
            });
        }
        const consolidation = await consolidationDossier.findByPk(id);

        if (!consolidation) {
            return res.status(404).json({
                state: false,
                message: "Consolidation non trouvée"
            });
        }
        await consolidation.destroy();
        return res.status(200).json({
            state: true,
            message: "Consolidation supprimé avec succès",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.getAllConsolidationCompte = async (req, res) => {
    try {
        const { id_compte, id_dossier } = req.params;
        if (!id_dossier || !id_compte) return res.status(409).json({ message: 'Données manquantes', state: false });

        const consolidationCompteData = (await consolidationCompte.findAll({
            where: {
                id_compte,
                id_dossier
            },
            include: [
                { model: dossiers, attributes: ['dossier'], as: 'dossierAutre' },
                { model: dossierPlanComptable, attributes: ['compte'], as: 'numCptPrincipal' },
                { model: dossierPlanComptable, attributes: ['compte'], as: 'numCptAutre' },
            ]
        }))
            .map((consolidation) => {
                const cData = consolidation.toJSON();

                cData.dossier_autre = cData?.dossierAutre?.dossier;
                cData.compte = cData?.numCptPrincipal?.compte;
                cData.compte_autre = cData?.numCptAutre?.compte;
                cData.id = Number(cData.id);
                cData.id_compte = Number(cData.id_compte);
                cData.id_dossier = Number(cData.id_dossier);
                cData.id_dossier_autre = Number(cData.id_dossier_autre);
                cData.id_numcpt = Number(cData.id_numcpt);
                cData.id_numcpt_autre = Number(cData.id_numcpt_autre)

                const { dossierAutre, numCptPrincipal, numCptAutre, ...filteredData } = cData;

                return filteredData;
            })
        return res.json(consolidationCompteData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}