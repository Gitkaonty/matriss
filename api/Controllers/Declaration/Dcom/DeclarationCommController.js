const bcrypt = require("bcrypt");
const db = require("../../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const fs = require('fs');
const { Op } = require('sequelize');
const csv = require('csv-parser');

const droitcommas = db.droitcommas;
const droitcommbs = db.droitcommbs;
const etatscomms = db.etatscomms;
const etatsplp = db.etatsplp;

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
                }
            }),
            droitcommbs.findAll({
                where: {
                    id_exercice,
                    id_dossier,
                    id_compte,
                    type: ['MV', 'PSV', 'PL']
                }
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

        // Regroupement par types
        const regrouped = {
            SVT: dataA.filter(el => el.type === 'SVT'),
            ADR: dataA.filter(el => el.type === 'ADR'),
            AC: dataA.filter(el => el.type === 'AC'),
            AI: dataA.filter(el => el.type === 'AI'),
            DEB: dataA.filter(el => el.type === 'DEB'),
            MV: dataB.filter(el => el.type === 'MV'),
            PSV: dataB.filter(el => el.type === 'PSV'),
            PL: dataB.filter(el => el.type === 'PL'),
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
        const { id, type } = req.body;
        if (!type || !id) {
            return res.status(400).json({
                state: false,
                message: "Données manquant"
            })
        }
        if (type === 'SVT' || type === 'ADR' || type === 'AC' || type === 'AI' || type === 'DEB') {
            await droitcommas.destroy({ where: { id, type } });
        } else if (type === 'MV' || type === 'PSV' || type === 'PL') {
            await droitcommbs.destroy({ where: { id, type } });
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
        if (!formData) {
            return res.status(400).json({
                state: false,
                message: "Données manquant"
            });
        }
        console.log('formData : ', formData);
        await droitcommas.update(formData, { where: { id } });
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
        if (!formData) {
            return res.status(400).json({
                state: false,
                message: "Données manquant"
            });
        }
        await droitcommbs.update(formData, { where: { id } });
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
        console.log('data : ', data);

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
        console.log('data : ', data);

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