'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('commentaire_analytique_mensuelle', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            id_compte: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            id_exercice: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            id_dossier: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            compte: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            commentaire: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            valide_anomalie: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('commentaire_analytique_mensuelle');
    }
};