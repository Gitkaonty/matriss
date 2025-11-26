'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rubriquesexternesevcpanalytiques', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'userscomptes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_dossier: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'dossiers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_exercice: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'exercices',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_etat: {
        type: Sequelize.STRING(25),
        allowNull: false,
        defaultValue: 0
      },
      id_rubrique: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 0
      },
      libelle: {
        type: Sequelize.STRING(250),
        allowNull: false,
        defaultValue: 0
      },
      note: {
        type: Sequelize.STRING(25),
        allowNull: true,
      },
      capitalsocial: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      primereserve: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      ecartdevaluation: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      resultat: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      report_anouveau: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      total_varcap: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      sensrubrique: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      ordre: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      niveau: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      nature: {
        type: Sequelize.STRING(15),
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rubriquesexternesevcpanalytiques');
  },
};
