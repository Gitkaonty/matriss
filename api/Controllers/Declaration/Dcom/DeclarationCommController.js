const bcrypt = require("bcrypt");
const db = require("../../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const fs = require('fs');
const { Op } = require('sequelize');
const csv = require('csv-parser');

const generateDComAuto = require('../../../Middlewares/DCom/declCommGenerateAuto');
const generateDroitComm = generateDComAuto.generateDroitComm;

const droitcommas = db.droitcommas;
const droitcommbs = db.droitcommbs;
const etatscomms = db.etatscomms;
const etatsplp = db.etatsplp;
const compterubriques = db.compterubriques;
const dossierplancomptable = db.dossierplancomptable;

exports.addDroitCommA = async (req, res) => {
    try {
        const { formData } = req.body;
        if (!formData) {
            return res.status(400).json({
                state: false,
                message: "Données manquant"
            });
        }
        await droitcommas.create(formData);
        return res.status(200).json({
            state: true,
            message: `Droit de communication ajouté`
        });
    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.addDroitCommB = async (req, res) => {
    try {
        const { formData } = req.body;
        if (!formData) {
            return res.status(400).json({
                state: false,
                message: "Données manquant"
            });
        }
        await droitcommbs.create(formData);
        return res.status(200).json({
            state: true,
            message: `Droit de communication ajouté`
        });
    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.getDroitCommGlobal = async (req, res) => {
    try {
        const { id_exercice, id_dossier, id_compte } = req.params;
        if (!id_exercice || !id_dossier || !id_compte) {
            return res.status(400).json({
                state: false,
                message: "Données manquantes"
            });
        }

        const [dataA, dataB, dataPlp] = await Promise.all([
            droitcommas.findAll({
                where: {
                    id_exercice,
                    id_dossier,
                    id_compte,
                    type: ['SVT', 'ADR', 'AC', 'AI', 'DEB']
                },
                include: [
                    {
                        model: dossierplancomptable,
                        attributes: ['compte']
                    }
                ],
                order: [['id', 'ASC']]
            }),
            droitcommbs.findAll({
                where: {
                    id_exercice,
                    id_dossier,
                    id_compte,
                    type: ['MV', 'PSV', 'PL']
                },
                include: [
                    {
                        model: dossierplancomptable,
                        attributes: ['compte']
                    }
                ],
                order: [['id', 'ASC']]
            }),
            etatsplp.findAll({
                where: {
                    id_exercice,
                    id_dossier,
                    id_compte,
                },
                order: [['id', 'ASC']]
            })
        ]);

        const regroupedDataA = dataA.map((val) => {
            const { dossierplancomptable, ...rest } = val.toJSON();
            return {
                ...rest,
                compte: dossierplancomptable?.compte || null,
            };
        })

        const regroupedDataB = dataB.map((val) => {
            const { dossierplancomptable, ...rest } = val.toJSON();
            return {
                ...rest,
                compte: dossierplancomptable?.compte || null,
            };
        })

        // Regroupement par types
        const regrouped = {
            SVT: regroupedDataA.filter(el => el.type === 'SVT'),
            ADR: regroupedDataA.filter(el => el.type === 'ADR'),
            AC: regroupedDataA.filter(el => el.type === 'AC'),
            AI: regroupedDataA.filter(el => el.type === 'AI'),
            DEB: regroupedDataA.filter(el => el.type === 'DEB'),
            MV: regroupedDataB.filter(el => el.type === 'MV'),
            PSV: regroupedDataB.filter(el => el.type === 'PSV'),
            PL: regroupedDataB.filter(el => el.type === 'PL'),
            PLP: dataPlp
        };

        return res.status(200).json({
            state: true,
            data: regrouped,
            message: `Données reçues`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            state: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};


exports.deleteAllCommByType = async (req, res) => {
    try {
        const { type } = req.body;
        if (!type) {
            return res.status(400).json({
                state: false,
                message: "Type manquant"
            })
        }
        let number = 0;
        if (type === 'SVT' || type === 'ADR' || type === 'AC' || type === 'AI' || type === 'DEB') {
            number = await droitcommas.destroy({ where: { type } });
        } else if (type === 'MV' || type === 'PSV' || type === 'PL') {
            number = await droitcommbs.destroy({ where: { type } });
        }
        // const droitcommasDeleted = await droitcommas.destroy({ where: { type } });
        return res.status(200).json({
            state: true,
            message: `${number} données supprimés avec succès`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.deleteOneCommByType = async (req, res) => {
    try {
        const { id, type, action, id_numcpt } = req.body;
        if (!type || !id || !action || !id_numcpt) {
            return res.status(400).json({
                state: false,
                message: "Données manquant"
            })
        }

        if (type === 'SVT' || type === 'ADR' || type === 'AC' || type === 'AI' || type === 'DEB') {
            const droitCommAData = droitcommas.findByPk(id);
            if (!droitCommAData) {
                return res.status(400).json({
                    state: false,
                    message: "Données non trouvées"
                });
            }

            const id_dossier = Number(droitCommAData.id_dossier);
            const id_compte = Number(droitCommAData.id_compte);
            const id_exercice = Number(droitCommAData.id_exercice);

            if (action === 'group') {
                await droitcommas.destroy({ where: { id_numcpt, type, id_dossier, id_compte, id_exercice } });
            }
            else {
                await droitcommas.destroy({ where: { id, type, id_dossier, id_compte, id_exercice } });
            }
        } else if (type === 'MV' || type === 'PSV' || type === 'PL') {
            const droitCommBData = droitcommbs.findByPk(id);
            if (!droitCommBData) {
                return res.status(400).json({
                    state: false,
                    message: "Données non trouvées"
                });
            }

            const id_dossier = Number(droitCommBData.id_dossier);
            const id_compte = Number(droitCommBData.id_compte);
            const id_exercice = Number(droitCommBData.id_exercice);

            if (action === 'group') {
                await droitcommbs.destroy({ where: { id_numcpt, type, id_dossier, id_compte, id_exercice } });
            } else {
                await droitcommbs.destroy({ where: { id, type, id_dossier, id_compte, id_exercice } });
            }
        }
        return res.status(200).json({
            state: true,
            message: `Ligne supprimé avec succès`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.updateDroitCommA = async (req, res) => {
    try {
        const { id } = req.params;
        const { formData } = req.body;
        const id_numcpt = Number(formData?.id_numcpt);

        if (!formData) {
            return res.status(400).json({
                state: false,
                message: "Données manquantes"
            });
        }

        if (!id) {
            return res.status(400).json({
                state: false,
                message: "Id manquantes"
            });
        }

        const droitCommAData = droitcommas.findByPk(id);
        if (!droitCommAData) {
            return res.status(400).json({
                state: false,
                message: "Données non trouvées"
            });
        }

        const id_dossier = Number(droitCommAData.id_dossier);
        const id_compte = Number(droitCommAData.id_compte);
        const id_exercice = Number(droitCommAData.id_exercice);

        const { comptabilisees, versees, ...filteredData } = formData;
        await droitcommas.update(filteredData, { where: { id_numcpt, id_dossier, id_compte, id_exercice } });

        return res.status(200).json({
            state: true,
            message: `Droit de communication modifié`
        });
    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.updateDroitCommB = async (req, res) => {
    try {
        const { id } = req.params;
        const { formData } = req.body;
        const id_numcpt = Number(formData?.id_numcpt);

        if (!formData) {
            return res.status(400).json({
                state: false,
                message: "Données manquant"
            });
        }

        if (!id) {
            return res.status(400).json({
                state: false,
                message: "Id manquantes"
            });
        }

        const droitCommBData = droitcommbs.findByPk(id);
        if (!droitCommBData) {
            return res.status(400).json({
                state: false,
                message: "Données non trouvées"
            });
        }

        const id_dossier = Number(droitCommBData.id_dossier);
        const id_compte = Number(droitCommBData.id_compte);
        const id_exercice = Number(droitCommBData.id_exercice);

        const { montanth_tva, tva, ...filteredData } = formData;
        await droitcommbs.update(filteredData, { where: { id_numcpt, id_dossier, id_compte, id_exercice } });
        return res.status(200).json({
            state: true,
            message: `Droit de communication modifié`
        });
    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.getVerrouillageComm = async (req, res) => {
    try {
        const { id_exercice, id_dossier, id_compte } = req.params;
        if (!id_exercice || !id_dossier || !id_compte) {
            return res.status(400).json({
                state: false,
                message: "Données manquantes"
            });
        }
        const resData = await etatscomms.findAll({
            where: {
                id_exercice,
                id_dossier,
                id_compte
            }
        });
        if (!resData) {
            return res.status(400).json({
                state: true,
                message: "Aucune données trouvé"
            });
        }
        return res.status(200).json({
            state: true,
            message: `Données trouvés`,
            data: resData
        });
    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.verrouillerTableComm = async (req, res) => {
    try {
        const { tableau, valide, id_dossier, id_compte, id_exercice } = req.body;
        const table = await etatscomms.findOne({
            where: {
                id_dossier,
                id_compte,
                id_exercice,
                code: tableau
            }
        })
        if (!table) {
            return res.status(400).json({
                state: true,
                message: "Aucune données trouvé"
            });
        }
        await table.update({
            valide
        })

        return res.status(200).json({
            state: true,
            message: `Données modifié`,
        });
    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.getListePlp = async (req, res) => {
    try {
        const { id_dossier, id_exercice, id_compte } = req.params;
        if (!id_exercice || !id_dossier || !id_compte) {
            return res.status(400).json({
                state: false,
                message: "Données manquantes"
            });
        }
        const dataPlp = await etatsplp.findAll({
            where: {
                id_dossier,
                id_exercice,
                id_compte
            }
        })
        return res.status(200).json({
            state: true,
            data: dataPlp,
            message: `Données reçues`
        });
    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.updateDroitCommPlp = async (req, res) => {
    try {
        const { id } = req.params;
        const { formData } = req.body;
        if (!formData) {
            return res.status(400).json({
                state: false,
                message: "Données manquant"
            });
        }
        await etatsplp.update(formData, { where: { id } });
        return res.status(200).json({
            state: true,
            message: `Droit de communication modifié`
        });
    } catch (error) {
        return res.status(500).json({
            state: false,
            message: "Erreur serveur", error: error.message
        });
    }
}

exports.importdroitCommA = async (req, res) => {
    try {
        const { data } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ state: false, message: "Données manquantes ou invalides" });
        }

        let lineAdded = 0;
        for (const d of data) {
            await droitcommas.create(d);
            lineAdded++;
        }

        return res.status(200).json({
            state: true,
            message: `${lineAdded} lignes ajoutées`
        });
    } catch (error) {
        return res.status(500).json({ state: false, message: "Erreur serveur", error: error.message });
    }
};

exports.importdroitCommB = async (req, res) => {
    try {
        const { data } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ state: false, message: "Données manquantes ou invalides" });
        }

        let lineAdded = 0;
        for (const d of data) {
            await droitcommbs.create(d);
            lineAdded++;
        }

        return res.status(200).json({
            state: true,
            message: `${lineAdded} ${lineAdded.length > 1 ? 'lignes ajoutées' : 'ligne ajouté'} avec succès`
        });
    } catch (error) {
        return res.status(500).json({ state: false, message: "Erreur serveur", error: error.message });
    }
};

const getIdRubrique = (nature) => {
    let id_rubrique = 0;
    if (nature === 'SVT') {
        id_rubrique = 1;
    } else if (nature === 'ADR') {
        id_rubrique = 2;
    } else if (nature === 'AC') {
        id_rubrique = 3;
    } else if (nature === 'AI') {
        id_rubrique = 4;
    } else if (nature === 'DEB') {
        id_rubrique = 5;
    } else if (nature === 'MV') {
        id_rubrique = 6;
    } else if (nature === 'PSV') {
        id_rubrique = 7;
    } else if (nature === 'PL') {
        id_rubrique = 8;
    }
    return id_rubrique;
}

exports.generateDCommAuto = async (req, res) => {
    try {
        const { id_compte, id_dossier, id_exercice, nature } = req.body;
        if (!id_exercice || !id_dossier || !id_compte || !nature) {
            return res.status(400).json({
                state: false,
                message: "Données manquantes"
            });
        }

        const id_rubrique = getIdRubrique(nature);

        const compteRubriques = await compterubriques.findAll({
            where: {
                id_dossier,
                id_compte,
                id_exercice,
                id_etat: 'DCOM',
                id_rubrique,
                active: true
            }
        })

        if (!compteRubriques || compteRubriques.length === 0) {
            return res.status(400).json({
                state: true,
                message: "Aucune données à générer automatiquement"
            });
        }

        if (['SVT', 'ADR', 'AC', 'AI', 'DEB'].includes(nature)) {
            await droitcommas.destroy({
                where: {
                    id_compte,
                    id_dossier,
                    id_exercice,
                    type: nature
                }
            })
        } else {
            await droitcommbs.destroy({
                where: {
                    id_compte,
                    id_dossier,
                    id_exercice,
                    type: nature
                }
            })
        }

        // return res.status(202).json(compteRubriques);

        if (nature) {
            await generateDroitComm(res, nature, compteRubriques, id_compte, id_dossier, id_exercice);
        } else {
            return res.status(400).json({
                state: false,
                message: "Nature non trouvé"
            });
        }
    } catch (error) {
        return res.status(500).json({ state: false, message: "Erreur serveur", error: error.message });
    }
}