'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('revision_analytique_resultats', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            id_compte: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            id_dossier: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            id_exercice: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            id_periode: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            id_jnl: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            compte: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            libelle: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            debit: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0
            },
            credit: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0
            },
            total_analytiques: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: true,
                defaultValue: 0
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        }, {
            timestamps: true
        });

        // Ajouter les index pour optimiser les requêtes
        await queryInterface.addIndex('revision_analytique_resultats', ['id_compte', 'id_dossier', 'id_exercice', 'id_periode'], {
            name: 'idx_revision_analytique_ids'
        });

        await queryInterface.addIndex('revision_analytique_resultats', ['id_jnl'], {
            name: 'idx_revision_analytique_jnl'
        });

        await queryInterface.addIndex('revision_analytique_resultats', ['compte'], {
            name: 'idx_revision_analytique_compte'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('revision_analytique_resultats');
    }
};
