'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('commentaireanalytiques', {
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
                comment: 'Référence au compte général (comptegen)'
            },
            commentaire: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            valide_anomalie: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Checkbox pour valider que l\'anomalie a été traitée'
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
        await queryInterface.dropTable('commentaireanalytiques');
    }
};
