const db = require("../../../Models");
const { Sequelize, Op } = require("sequelize");
const rubriquesExternes = db.rubriquesExternes;
const compteRubriquesExternes = db.compteRubriquesExternes;
const compteRubriquesExternesMatrices = db.compteRubriquesExternesMatrices;

exports.getRubriquesExternes = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice } = req.params;
        if (!id_compte) {
            return res.status(400).json({ state: false, message: 'Id_compte non trouvé' });
        }
        if (!id_dossier) {
            return res.status(400).json({ state: false, message: 'Id_dossier non trouvé' });
        }
        if (!id_exercice) {
            return res.status(400).json({ state: false, message: 'Id_exercice non trouvé' });
        }
        const rubriquesExternesData = (await rubriquesExternes.findAll({
            where: { id_compte, id_dossier, id_exercice },
            order: [['ordre', 'ASC']]
        })).map(r => ({
            ...r.toJSON(),
            id: Number(r.id),
            id_compte: Number(r.id_compte),
            id_dossier: Number(r.id_dossier),
            id_exercice: Number(r.id_exercice),
        }));

        const regrouped = {
            BILAN_ACTIF: rubriquesExternesData.filter(el => el.id_etat === "BILAN_ACTIF"),
            BILAN_PASSIF: rubriquesExternesData.filter(el => el.id_etat === "BILAN_PASSIF"),
            CRN: rubriquesExternesData.filter(el => el.id_etat === "CRN"),
            CRF: rubriquesExternesData.filter(el => el.id_etat === "CRF"),
            TFTD: rubriquesExternesData.filter(el => el.id_etat === "TFTD"),
            TFTI: rubriquesExternesData.filter(el => el.id_etat === "TFTI"),
            SIG: rubriquesExternesData.filter(el => el.id_etat === "SIG"),
        }
        return res.json({
            liste: regrouped,
            state: true,
            message: "Récupéré avec succès"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.addRubriquesExternes = async (req, res) => {
    try {
        const formData = req.body;
        if (!formData) {
            return res.status(400).json({
                state: false,
                message: "Données manquant"
            });
        }
        const { id_rubrique, id_compte, id_dossier, id_exercice } = formData;
        const isExistingRubrique = await rubriquesExternes.findOne({
            where: {
                id_rubrique,
                id_compte,
                id_dossier,
                id_exercice
            }
        })
        if (isExistingRubrique) {
            return res.status(200).json({
                state: false,
                message: `Cette combinaison de rubrique, compte, dossier et exercice existe déjà`
            });
        }
        await rubriquesExternes.create(formData);
        return res.status(200).json({
            state: true,
            message: `Rubrique ajouté avec succès`
        });
    } catch (error) {
        console.error(error);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(200).json({
                state: false,
                message: 'Cette combinaison de rubrique, compte, dossier et exercice existe déjà'
            });
        }
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.updateRubriquesExternes = async (req, res) => {
    try {
        const { id } = req.params;
        const formData = req.body;
        const { ordre: newOrdre } = formData;

        if (!formData || !id) {
            return res.status(400).json({
                state: false,
                message: "Données manquantes"
            });
        }

        const rubrique = await rubriquesExternes.findByPk(id);

        if (!rubrique) {
            return res.status(404).json({
                state: false,
                message: "Rubrique Externe non trouvée"
            });
        }

        const oldOrdre = rubrique.ordre;
        if (newOrdre !== undefined && newOrdre !== oldOrdre) {
            if (oldOrdre < newOrdre) {
                const rubriques = await rubriquesExternes.findAll({
                    where: {
                        id_compte: rubrique.id_compte,
                        id_dossier: rubrique.id_dossier,
                        id_exercice: rubrique.id_exercice,
                        ordre: {
                            [Sequelize.Op.gte]: oldOrdre
                        }
                    },
                    order: [['ordre', 'ASC']]
                });

                await Promise.all(rubriques
                    .filter(r => r.id !== rubrique.id)
                    .map((r, i) => {
                        r.ordre = newOrdre + 1 + i;
                        return r.save();
                    })
                );
            } else {
                return res.status(200).json({
                    state: false,
                    message: "Veuillez saisir une ordre suppérieur à l'ancien",
                });
            }

            rubrique.ordre = newOrdre;
        }

        rubrique.ordre = newOrdre ?? rubrique.ordre;
        rubrique.libelle = formData.libelle ?? rubrique.libelle;
        rubrique.type = formData.type ?? rubrique.type;
        rubrique.id_rubrique = formData.id_rubrique ?? rubrique.id_rubrique;
        rubrique.id_compte = formData.id_compte ?? rubrique.id_compte;
        rubrique.id_etat = formData.id_etat ?? rubrique.id_etat;

        await rubrique.save()

        return res.status(200).json({
            state: true,
            message: "Rubrique mise à jour avec succès",
            data: rubrique
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.deleteRubriquesExternes = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                state: false,
                message: "Id manquante"
            });
        }
        const rubrique = await rubriquesExternes.findByPk(id);

        if (!rubrique) {
            return res.status(404).json({
                state: false,
                message: "Rubrique Externe non trouvée"
            });
        }
        
        const id_dossier = rubrique.id_dossier;
        const id_exercice = rubrique.id_exercice;
        const id_compte = rubrique.id_compte;
        const id_rubrique = rubrique.id_rubrique || "";

        await rubrique.destroy();
        await compteRubriquesExternes.destroy({
            where: {
                id_dossier,
                id_compte,
                id_exercice,
                id_rubrique
            }
        })
        return res.status(200).json({
            state: true,
            message: "Rubrique supprimé avec succès",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.addOrUpdateRubriqueExterne = async (req, res) => {
    try {
        const { compteId, exerciceId, fileId, idExterne, id_etat, id_rubrique, libelle, ordre, type, subtable, active, par_default } = req.body;
        const newOrdre = Number(ordre);

        let resData = {
            state: false,
            msg: 'Une erreur est survenue au moment du traitement.',
        }

        const testIfExist = await rubriquesExternes.findAll({
            where: {
                id: idExterne,
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId
            }
        });

        if (testIfExist.length === 0) {
            const isExistingRubrique = await rubriquesExternes.findOne({
                where: {
                    id_rubrique,
                    id_etat,
                    subtable,
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId
                }
            })

            if (isExistingRubrique) {
                return res.status(200).json({
                    state: false,
                    msg: `Cette Rubrique existe déjà dans ${id_etat}`
                });
            }
            const addRubriqueExterne = await rubriquesExternes.create({
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId,
                id_etat: id_etat,
                id_rubrique: id_rubrique,
                libelle: libelle,
                ordre: ordre,
                type: type,
                subtable: subtable,
                active: active,
                par_default: par_default
            });

            if (addRubriqueExterne) {
                resData.state = true;
                resData.msg = "Nouvelle ligne sauvegardée avec succès.";
            } else {
                resData.state = false;
                resData.msg = "Une erreur est survenue au moment du traitement des données";
            }
        } else {
            const rubrique = await rubriquesExternes.findByPk(idExterne);

            if (!rubrique) {
                return res.status(404).json({
                    state: false,
                    message: "Rubrique Externe non trouvée"
                });
            }

            const oldOrdre = rubrique.ordre;
            if (newOrdre !== undefined && newOrdre !== oldOrdre) {
                if (oldOrdre < newOrdre) {
                    const rubriques = await rubriquesExternes.findAll({
                        where: {
                            id_compte: rubrique.id_compte,
                            id_dossier: rubrique.id_dossier,
                            id_exercice: rubrique.id_exercice,
                            id_etat,
                            subtable,
                            ordre: {
                                [Sequelize.Op.gte]: oldOrdre
                            }
                        },
                        order: [['ordre', 'ASC']]
                    });

                    await Promise.all(rubriques
                        .filter(r => r.id !== rubrique.id)
                        .map((r, i) => {
                            r.ordre = newOrdre + 1 + i;
                            return r.save();
                        })
                    );
                } else {
                    const rubriques = await rubriquesExternes.findAll({
                        where: {
                            id_compte: rubrique.id_compte,
                            id_dossier: rubrique.id_dossier,
                            id_exercice: rubrique.id_exercice,
                            id_etat,
                            subtable,
                            ordre: {
                                [Sequelize.Op.lte]: oldOrdre,
                                [Sequelize.Op.gte]: newOrdre
                            }
                        },
                        order: [['ordre', 'DESC']]
                    });

                    for (let r of rubriques) {
                        if (r.id !== rubrique.id) {
                            r.ordre += 1;
                            await r.save();
                        }
                    }
                }

                rubrique.ordre = newOrdre;
            }

            rubrique.libelle = libelle;
            rubrique.type = type;
            rubrique.id_rubrique = id_rubrique;
            rubrique.id_etat = id_etat;
            rubrique.active = active;
            rubrique.par_default = par_default;

            const updatedRubriqueExterne = await rubrique.save();
            if (updatedRubriqueExterne) {
                resData.state = true;
                resData.msg = "Modification effectuée avec succès.";
            } else {
                resData.state = false;
                resData.msg = "Une erreur est survenue au moment du traitement des données";
            }
        }

        return res.json(resData);

    } catch (error) {
        console.error(error);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(200).json({
                state: false,
                message: 'Cette combinaison de rubrique, compte, dossier et exercice existe déjà'
            });
        }
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.getCompteRubriqueExterne = async (req, res) => {
    try {
        const { compteId, fileId, exerciceId, tableau, choixPoste, rubriqueId } = req.body;
        let resData = {
            state: false,
            msg: 'Données récupérées avec succès',
            liste: []
        }
        if (rubriqueId) {
            const liste = await compteRubriquesExternes.findAll({
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    id_etat: tableau,
                    nature: choixPoste,
                    id_rubrique: rubriqueId
                },
                order: [['compte', 'ASC']]
            })
            if (liste) {
                resData.state = true;
                resData.liste = liste;
            } else {
                resData.state = false;
                resData.msg = "Une erreur est survenue au moment du traitement des données";
            }
        } else {
            resData.state = true;
            resData.liste = [];
        }
        return res.json(resData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.deleteCompteRubriqueExterne = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                state: false,
                message: "Id manquante"
            });
        }
        const compteRubrique = await compteRubriquesExternes.findByPk(id);
        if (!compteRubrique) {
            return res.status(404).json({
                state: false,
                message: "Rubrique externe non trouvée"
            });
        }
        await compteRubrique.destroy();
        return res.status(200).json({
            state: true,
            message: "Compte rubrique supprimé avec succès",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.addOrUpdateCompteRubriqueExterne = async (req, res) => {
    try {
        const { idParam, compteId, fileId, exerciceId, id_etat, tableau, rubriqueId, nature, compte, senscalcul, condition, equation, par_default, active } = req.body;

        let resData = {
            state: false,
            msg: 'Une erreur est survenue au moment du traitement.',
        }

        // const rubriqueData = (await rubriquesExternes.findAll({
        //     where: {
        //         id_compte: compteId,
        //         id_dossier: fileId,
        //         id_exercice: exerciceId,
        //         id_etat,
        //         active: true
        //     }
        // })).map(r => ({
        //     ...r.toJSON(),
        //     id: Number(r.id),
        //     id_compte: Number(r.id_compte),
        //     id_dossier: Number(r.id_dossier),
        //     id_exercice: Number(r.id_exercice),
        // })).filter(r =>
        //     ['RUBRIQUE', 'SOUS-RUBRIQUE', 'LIAISON', 'LIAISON VAR ACTIF', 'LIAISON VAR PASSIF'].includes(r.type)
        // );

        // const idRubriqueList = [...new Set(rubriqueData.map(val => val.id_rubrique))];

        // const compteRubriqueData = (await compteRubriquesExternes.findAll({
        //     where: {
        //         id_compte: compteId,
        //         id_dossier: fileId,
        //         id_exercice: exerciceId,
        //         active: true,
        //         id_rubrique: idRubriqueList,
        //         compte: compte,
        //         id_etat
        //     }
        // })).map(r => ({
        //     ...r.toJSON(),
        //     id: Number(r.id),
        //     id_compte: Number(r.id_compte),
        //     id_dossier: Number(r.id_dossier),
        //     id_exercice: Number(r.id_exercice),
        // }));

        // if (compteRubriqueData.length) {
        //     resData.state = false;

        //     const etats = [...new Set(compteRubriqueData.map(c => c.id_etat))].join(', ');
        //     const rubriques = [...new Set(compteRubriqueData.map(c => c.id_rubrique))].join(', ');

        //     resData.msg = `Cette compte existe déjà dans : ${etats} dans le rubrique : ${rubriques}`;
        //     return res.json(resData);
        // }

        const testIfExist = await compteRubriquesExternes.findAll({
            where: {
                id: idParam,
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId,
                compte: compte,
            }
        });

        if (testIfExist.length === 0) {
            const addParam = await compteRubriquesExternes.create({
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId,
                id_etat: id_etat,
                tableau: tableau,
                id_rubrique: rubriqueId,
                compte: compte,
                nature: nature,
                senscalcul: senscalcul,
                condition: condition,
                equation: equation,
                par_default: par_default,
                active: active
            });

            if (addParam) {
                resData.state = true;
                resData.msg = "Nouvelle ligne sauvegardée avec succès.";
            } else {
                resData.state = false;
                resData.msg = "Une erreur est survenue au moment du traitement des données";
            }
        } else {
            const ModifyParam = await compteRubriquesExternes.update(
                {
                    id_compte: compteId,
                    id_dossier: fileId,
                    id_exercice: exerciceId,
                    id_etat: id_etat,
                    tableau: tableau,
                    id_rubrique: rubriqueId,
                    compte: compte,
                    nature: nature,
                    senscalcul: senscalcul,
                    condition: condition,
                    equation: equation,
                    par_default: par_default,
                    active: active
                },
                {
                    where: { id: idParam }
                }
            );

            if (ModifyParam) {
                resData.state = true;
                resData.msg = "Modification effectuée avec succès.";
            } else {
                resData.state = false;
                resData.msg = "Une erreur est survenue au moment du traitement des données";
            }
        }
        return res.json(resData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.restaureDefaultParameter = async (req, res) => {
    try {
        const { id_dossier, id_compte, id_exercice, id_etat } = req.body;

        let resData = {
            state: false,
            msg: 'Une erreur est survenue',
            fileInfos: []
        }

        const restaureDefaultParams1 = await compteRubriquesExternes.update(
            {
                active: false
            },
            {
                where: {
                    id_dossier: id_dossier,
                    id_compte: id_compte,
                    id_exercice: id_exercice,
                    id_etat: id_etat,
                    par_default: false
                }
            }
        );

        const restaureDefaultParams2 = await compteRubriquesExternes.update(
            {
                active: true
            },
            {
                where: {
                    id_dossier: id_dossier,
                    id_compte: id_compte,
                    id_exercice: id_exercice,
                    id_etat: id_etat,
                    par_default: true
                }
            }
        );

        if (restaureDefaultParams1 && restaureDefaultParams2) {
            resData.state = true;
            resData.msg = "Restauration paramétrages terminée avec succès";
        } else {
            resData.state = false;
            resData.msg = "Une erreur est survenue au moment du traitement des données.";
        }

        return res.json(resData);
    } catch (error) {
        console.log(error);
    }
}

exports.updateDefaultParameter = async (req, res) => {
    try {
        const { id_dossier, id_compte, id_exercice, id_etat } = req.body;

        let resData = {
            state: false,
            msg: 'Une erreur est survenue',
            fileInfos: []
        }

        await compteRubriquesExternes.destroy({
            where:
            {
                id_compte: id_compte,
                id_dossier: id_dossier,
                id_exercice: id_exercice,
                id_etat: id_etat,
                par_default: true
            }
        });

        const listeCompteRubrique = await compteRubriquesExternesMatrices.findAll({
            where: {
                id_etat: id_etat === 'BILAN' ? { [Op.in]: ['BILAN_ACTIF', 'BILAN_PASSIF'] } : id_etat
            }
        });

        if (listeCompteRubrique.length > 0) {
            listeCompteRubrique.map(async (item) => {
                await compteRubriquesExternes.create({
                    id_compte: id_compte,
                    id_dossier: id_dossier,
                    id_exercice: id_exercice,
                    id_etat: item.id_etat,
                    id_rubrique: item.id_rubrique,
                    tableau: item.tableau,
                    compte: item.compte,
                    nature: item.nature,
                    senscalcul: item.senscalcul,
                    condition: item.condition,
                    equation: item.equation,
                    par_default: true,
                    active: true,
                });
            });

            resData.state = true;
            resData.msg = "Mise à jour des paramétrages terminée avec succès";
        } else {
            resData.state = false;
            resData.msg = "Une erreur est survenue au moment du traitement des données.";
        }

        return res.json(resData);
    } catch (error) {
        console.log(error);
    }
}