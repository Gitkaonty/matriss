'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // await queryInterface.addColumn('journals', 'id_devise', {
    //   type: Sequelize.BIGINT,
    //   allowNull: true,
    // });

    // await queryInterface.addColumn('journals', 'taux', {
    //   type: Sequelize.DOUBLE,
    //   allowNull: true,
    //   defaultValue: 0,
    // });

    // await queryInterface.addColumn('journals', 'montant_devise', {
    //   type: Sequelize.DOUBLE,
    //   allowNull: true,
    //   defaultValue: 0,
    // });

    // await queryInterface.addColumn('journals', 'num_facture', {
    //   type: Sequelize.STRING(50),
    //   allowNull: true,
    //   defaultValue: '',
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn('journals', 'id_devise');
    // await queryInterface.removeColumn('journals', 'taux');
    // await queryInterface.removeColumn('journals', 'montant_devise');
    // await queryInterface.removeColumn('journals', 'num_facture');
  }
};
