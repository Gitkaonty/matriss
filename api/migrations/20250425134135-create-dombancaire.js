/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('dombancaires', {
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      id_dossier: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue:0
      },
      banque: {
          type: Sequelize.STRING(50),
          unique: false,
          allowNull: true
      },
      numcompte: {
        type: Sequelize.STRING(50),
        unique: false,
        allowNull: true
      },
      devise: {
        type: Sequelize.STRING(15),
        unique: false,
        allowNull: true
      },
      pays: {
        type: Sequelize.STRING(75),
        unique: false,
        allowNull: true
      },
      enactivite: {
        type: Sequelize.BOOLEAN,
        unique: false,
        allowNull: false,
        defaultValue:false
      },
      },
      {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('dombancaires');
  }
};
