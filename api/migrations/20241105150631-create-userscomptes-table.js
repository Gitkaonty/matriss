'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('userscomptes', {
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      nom: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(150),
        unique: true,
        isEmail: true,
        allowNull: true
      },
      raison_sociale: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      nif: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      stat: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      numero_telephone: {
        type: DataTypes.STRING(25),
        allowNull: true
      },
      type_abonnement: {
        type: DataTypes.STRING(25),
        allowNull: true
      },
    },
      { timestamps: true }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('userscomptes');
  }
};
