module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.addColumn('journals', 'fichier', {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    //   defaultValue: null
    // });
  },
  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn('jornals', 'fichier');
  }
};