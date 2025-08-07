'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('etatscomatrices', [
      {
        code: 'SVT',
        nom: 'Sommes versées à des tiers',
        ordre: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ADR',
        nom: 'Achats de marchandises destinées à la revente',
        ordre: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'AC',
        nom: 'Achats non destinés à la vente',
        ordre: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'AI',
        nom: 'Achats immobilisés',
        ordre: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DEB',
        nom: 'Debours',
        ordre: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MV',
        nom: 'Marchandises vendues',
        ordre: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PSV',
        nom: 'Prestations de services vendues',
        ordre: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PL',
        nom: 'Produis locaux',
        ordre: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PLP',
        nom: 'Produis locaux par produits',
        ordre: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('etatscomatrices', null, {});
  }
};
