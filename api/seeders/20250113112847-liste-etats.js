'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('etatsmatrices', [
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
        code: 'BHIAPC',
        nom: 'Etat des bénéficiaires d\'honoraires, d\'intérêts ou d\'arrerages portes en charge',
        ordre: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MP',
        nom: 'Etat séparé et détaillé des produits relatifs aux marché publics et autres que marchés publics de la période',
        ordre: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DA',
        nom: 'Détails des amortissements',
        ordre: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DP',
        nom: 'Détails des provisions',
        ordre: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'EIAFNC',
        nom: 'Evolution des immobilisations et des actifs financiers non courants',
        ordre: 11,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SAD',
        nom: 'Suivi des amortissements différés',
        ordre: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SDR',
        nom: 'Suivi des déficits reportables (Hors amortissements différés)',
        ordre: 13,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SE',
        nom: 'Suivi des emprunts',
        ordre: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NE',
        nom: 'Note explicative',
        ordre: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('etatsmatrices', null, {});
  }
};
