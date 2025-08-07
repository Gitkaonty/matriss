'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('casections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      section: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      intitule: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      compte: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      pourcentage: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      par_defaut: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      fermer: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
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
      id_axe: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'caaxes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('casections');
  }
};
