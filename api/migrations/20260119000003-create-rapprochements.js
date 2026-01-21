'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rapprochements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'userscomptes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'dossiers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_exercice: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'exercices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pc_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      date_debut: {
        type: Sequelize.DATE,
        allowNull: true
      },
      date_fin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      solde_comptable: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      solde_bancaire: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      solde_non_rapproche: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajouter des index pour améliorer les performances
    await queryInterface.addIndex('rapprochements', ['id_dossier', 'id_exercice', 'pc_id']);
    await queryInterface.addIndex('rapprochements', ['date_debut', 'date_fin']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('rapprochements');
  }
};
