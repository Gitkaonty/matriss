"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addColumn("journals", "decltvamois", {
    //   type: Sequelize.INTEGER,
    //   allowNull: true,
    //   defaultValue: 0,
    //   after: "num_facture",
    // });
    // await queryInterface.addColumn("journals", "decltvaannee", {
    //   type: Sequelize.INTEGER,
    //   allowNull: true,
    //   defaultValue: 0,
    //   after: "decltvamois",
    // });
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeColumn("journals", "decltvaannee");
    // await queryInterface.removeColumn("journals", "decltvamois");
  },
};
