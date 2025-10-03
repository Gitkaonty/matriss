const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const controles = db.controles;
const etats = db.etats;
const controlematrices = db.controlematrices;
const controlematricedetails = db.controlematricedetails;

const controletableau = async (declaration, tableau, id_compte, id_dossier, id_exercice) => {
    try {
        const liste = await controlematrices.findAll({
            where: {
                declaration: declaration,
                etat_id: tableau,
            },
            raw: true,
            order: [['control_id', 'ASC']],
        });

        if (liste.length > 0) {
            controles.destroy({
                where:
                {
                    id_compte: id_compte,
                    id_dossier: id_dossier,
                    id_exercice: id_exercice,
                    declaration: declaration,
                    etat_id: tableau,
                }
            });

            for (let item of liste) {
                const details = await controlematricedetails.findAll({
                    where: {
                        declaration: declaration,
                        etat_id: tableau,
                        control_id: item.control_id
                    },
                    raw: true,
                    order: [['control_id', 'ASC']],
                });

                if (item.typecontrol === 'COMPARAISON') {
                    if (item.typecomparaison === 'EGAL') {

                        let total = 0;
                        if (details.length > 0) {
                            for (let det of details) {
                                if (det.subtable < 3) {
                                    const totaltemp = await db.sequelize.query(`
                                        SELECT SUM( ${det.colonnetotal} ) as sold FROM ${det.tablename}
                                        as tabA WHERE tabA.id_compte = :id_compte AND tabA.id_dossier = :id_dossier AND tabA.id_exercice = :id_exercice
                                        AND ${det.colonnefiltre} = ${Number(det.ligne)} AND id_etat = '${det.tableau}' AND subtable = ${det.subtable}
                                        `,
                                        {
                                            replacements: { id_compte, id_dossier, id_exercice },
                                            type: db.Sequelize.QueryTypes.SELECT
                                        }
                                    );

                                    const soldtemp = totaltemp[0]?.sold ?? 0;

                                    if (det.operation === 'ADD') {
                                        total = total + soldtemp;
                                    } else if (det.operation === 'SOUS') {
                                        total = total - soldtemp;
                                    }

                                } else {
                                    const totaltemp = await db.sequelize.query(`
                                        SELECT SUM( ${det.colonnetotal} ) as sold FROM ${det.tablename}
                                        as tabA WHERE tabA.id_compte = :id_compte AND tabA.id_dossier = :id_dossier AND tabA.id_exercice = :id_exercice
                                        AND ${det.colonnefiltre} = '${det.ligne}'
                                        `,
                                        {
                                            replacements: { id_compte, id_dossier, id_exercice },
                                            type: db.Sequelize.QueryTypes.SELECT
                                        }
                                    );

                                    const soldtemp = totaltemp[0]?.sold ?? 0;

                                    if (det.operation === 'ADD') {
                                        total = total + soldtemp;
                                    } else if (det.operation === 'SOUS') {
                                        total = total - soldtemp;
                                    }
                                }
                            }
                        }

                        if (parseFloat(total.toFixed(2)) !== 0) {
                            await controles.create({
                                id_compte: id_compte,
                                id_dossier: id_dossier,
                                id_exercice: id_exercice,
                                declaration: item.declaration,
                                etat_id: item.etat_id,
                                control_id: item.control_id,
                                nbranomalie: 1,
                                anomalie: `${item.comments} Ecart de ${total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            });

                            const tableNbrAnom = await controles.findAll({
                                where: {
                                    id_compte: id_compte,
                                    id_dossier: id_dossier,
                                    id_exercice: id_exercice,
                                    etat_id: item.etat_id,
                                },
                                raw: true,
                            });

                            const totalAnom = tableNbrAnom.reduce((somme, ligne) => {
                                return somme + (ligne.nbranomalie || 0); // Remplace "montant" par le nom de ta colonne
                            }, 0);

                            await etats.update(
                                {
                                    nbranomalie: totalAnom
                                },
                                {
                                    where:
                                    {
                                        id_compte: id_compte,
                                        id_dossier: id_dossier,
                                        id_exercice: id_exercice,
                                        code: item.etat_id
                                    }
                                }
                            );
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    controletableau
};