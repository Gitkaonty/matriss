'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Supprimer toutes les données existantes
    await queryInterface.bulkDelete('listecodetvas', null, {});

    // Insérer les nouveaux codes TVA simplifiés
    await queryInterface.bulkInsert('listecodetvas', [
      {
        code: 'TVA_DED',
        nature: 'DED',
        libelle: 'TVA déductible',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TVA_COLL',
        nature: 'COLL',
        libelle: 'TVA Collectée',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TVA_IMMO',
        nature: 'IMMO',
        libelle: 'TVA sur immobilisation',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TVA_CRED',
        nature: 'CRED',
        libelle: 'Crédit de TVA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TVA_APAYER',
        nature: 'APAYER',
        libelle: 'TVA à payer',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('listecodetvas', null, {});
  }
};
