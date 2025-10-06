'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('declisis', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
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
      id_numcpt: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'dossierplancomptables',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_ecriture: {
        type: Sequelize.STRING(25),
        unique: true,
        allowNull: false
      },
      nom: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      cin: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      nature_transaction: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      detail_transaction: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      date_transaction: {
        type: Sequelize.DATE,
        allowNull: true
      },
      montant_transaction: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      montant_isi: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      district: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      commune: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      fokontany: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      validite: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      anomalie: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      declisimois: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      declisiannee: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('declisis');
  }
};
