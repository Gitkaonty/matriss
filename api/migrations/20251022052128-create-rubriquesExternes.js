'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rubriquesexternes', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      id_rubrique: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 0
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
      id_etat: {
        type: Sequelize.STRING(25),
        allowNull: false,
        defaultValue: 0
      },
      libelle: {
        type: Sequelize.STRING(250),
        allowNull: false,
        defaultValue: 0
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 0
      },
      ordre: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      subtable: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      par_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      montantbrut: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      montantamort: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      montantnet: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      montantnetn1: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      variation: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      pourcentagen: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      pourcentagen1: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0
      },
      pourcentagevariation: {
        type: Sequelize.DOUBLE,
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
    await queryInterface.dropTable('rubriquesexternes');
  }
};
