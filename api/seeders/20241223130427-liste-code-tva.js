'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('listecodetvas', [
      {
        code: '200',
        nature: 'COLL',
        libelle: 'TVA Collectée (Gaz butane, Pates alimentaire de fabrication locale)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '205',
        nature: 'COLL',
        libelle: 'TVA Collectée (Supercarburant titrant 95 indice d’octane et plus , Gas-oil)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '210A',
        nature: 'COLL',
        libelle: 'TVA Collectée sur les opérations transport terrestre de marchandises/hydrocarbures',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '210B',
        nature: 'COLL',
        libelle: 'TVA Collectée sur sur les ventes des biens',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '210C',
        nature: 'COLL',
        libelle: 'TVA Collectée sur les prestations de services',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '210D',
        nature: 'COLL',
        libelle: 'TVA Collectée sur les travaux immobiliers',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '210E',
        nature: 'COLL',
        libelle: 'TVA Collectée sur les produits de cession d immobilisations',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '210F',
        nature: 'COLL',
        libelle: 'TVA Collectée sur les montant des livraisons à soi-même',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '270',
        nature: 'COLL',
        libelle: 'Autres TVA collectées sur régularisations',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '271',
        nature: 'COLL',
        libelle: 'TVA collectée non encore encaissée sur Marchés publics (140xtaux)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '272',
        nature: 'COLL',
        libelle: 'Report - TVA collectée non encore encaissée sur Marchés publics',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '273',
        nature: 'COLL',
        libelle: 'TVA collectée encaissée sur Marchés publics de la période',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '300',
        nature: 'DED',
        libelle: 'TVA déductible sur les biens locaux destinés à la revente',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '305',
        nature: 'DED',
        libelle: 'TVA déductibles sur les biens importés destinés à la revente',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '315',
        nature: 'DED',
        libelle: 'TVA déductible sur investissements incorporels (importés et/ou locaux) : non éligibles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '316',
        nature: 'DED',
        libelle: 'TVA déductible sur investissements corporels locaux non éligibles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '320',
        nature: 'DED',
        libelle: 'TVA déductible sur investissements corporels locaux éligibles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '330',
        nature: 'DED',
        libelle: 'TVA déductible sur investissements corporels importés éligibles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '335',
        nature: 'DED',
        libelle: 'TVA déductible sur investissements corporels importés non éligibles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '338',
        nature: 'DED',
        libelle: 'TVA déductible sur achats gazole liés aux opérations de transport terrestre de marchandises et hydrocarbures',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '340',
        nature: 'DED',
        libelle: 'TVA déductible sur les autres biens locaux',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '345',
        nature: 'DED',
        libelle: 'TVA déductible sur les autres biens importés',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '350',
        nature: 'DED',
        libelle: 'TVA déductible sur les services locaux',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '355',
        nature: 'DED',
        libelle: 'TVA déductible sur les services importés',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '359',
        nature: 'DED',
        libelle: 'Régularisation TVA déductibles sur acquisitions de biens, services et d’équipements/immeubles (+ ou -)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('listecodetvas', null, {});
  }
};
