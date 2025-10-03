"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add columns mois and annee (nullable initially)
    await queryInterface.addColumn("formulaire_tva_annexes", "mois", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("formulaire_tva_annexes", "annee", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Create composite unique index including period
    await queryInterface.addIndex("formulaire_tva_annexes", [
      "id_dossier",
      "id_compte",
      "id_exercice",
      "id_code",
      "mois",
      "annee",
    ], {
      unique: true,
      name: "uniq_formulaire_tva_by_period",
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop index then columns
    await queryInterface.removeIndex(
      "formulaire_tva_annexes",
      "uniq_formulaire_tva_by_period"
    );
    await queryInterface.removeColumn("formulaire_tva_annexes", "annee");
    await queryInterface.removeColumn("formulaire_tva_annexes", "mois");
  },
};
