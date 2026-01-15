'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addColumn({ tableName: 'details_immo', schema: 'public' }, 'reprise_immobilisation', {
    //   type: Sequelize.BOOLEAN,
    //   allowNull: false,
    //   defaultValue: false,
    // });

    // await queryInterface.addColumn({ tableName: 'details_immo', schema: 'public' }, 'date_reprise', {
    //   type: Sequelize.DATEONLY,
    //   allowNull: true,
    // });
  },

  async down(queryInterface) {
    // await queryInterface.removeColumn({ tableName: 'details_immo', schema: 'public' }, 'date_reprise');
    // await queryInterface.removeColumn({ tableName: 'details_immo', schema: 'public' }, 'reprise_immobilisation');
  },
};
