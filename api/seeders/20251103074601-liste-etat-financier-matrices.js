'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('etatsetatfinanciermatrices', [
      {
        code: 'BILAN',
        nom: 'Bilan',
        ordre: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CRN',
        nom: 'Compte de résultat par nature',
        ordre: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CRF',
        nom: 'Compte de résultat par fonction',
        ordre: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TFTD',
        nom: 'Tableau de flux de trésorie (méthode directe)',
        ordre: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TFTI',
        nom: 'Tableau de flux de trésorerie (méthode indirect)',
        ordre: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'EVCP',
        nom: 'Etat de variation des capitaux propres',
        ordre: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SIG',
        nom: 'Soldes intermédiaires de géstion',
        ordre: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('etatsetatfinanciermatrices', null, {});
  }
};
