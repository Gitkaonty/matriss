"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.addColumn("journals", "decltva", {
    //   type: Sequelize.BOOLEAN,
    //   allowNull: true,
    //   defaultValue: false,
    //   after: "decltvaannee",
    // });
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeColumn("journals", "decltva");
  },
};
