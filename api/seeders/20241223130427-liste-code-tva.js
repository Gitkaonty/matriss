'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('listecodetvas', [
      {
        code: '100',
        nature: 'CA',
        libelle: 'Chiffre d’affaires taxable relatif aux exportations',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '102',
        nature: 'CA',
        libelle: 'Chiffre d’affaires taxable 5%',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '103',
        nature: 'CA',
        libelle: 'Chiffre d’affaires taxable 15%',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '105',
        nature: 'CA',
        libelle: 'Chiffre d’affaires taxable 20%',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '106',
        nature: 'CA',
        libelle: 'Chiffre d’affaires taxable sur les ventes des biens',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '107',
        nature: 'CA',
        libelle: 'Chiffre d’affaires taxable sur les prestations de services',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '108',
        nature: 'CA',
        libelle: 'Chiffre d’affaires taxable sur les travaux immobiliers',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '115',
        nature: 'CA',
        libelle: 'Produits de cession d\'immobilisations (taux 20%)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '125',
        nature: 'CA',
        libelle: 'Montant des livraisons à soi-même (taux 20%)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '130',
        nature: 'CA',
        libelle: 'Chiffre d’affaires objet d une Attestation de destination (AD)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '140',
        nature: 'CA',
        libelle: 'Chiffre d’affaires taxable s/Marchés publics dont la TVA est encore non encaissée',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '150',
        nature: 'CA',
        libelle: 'Montant total des affaires taxables',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '155',
        nature: 'CA',
        libelle: 'Chiffre d’affaires sur Marchés publics soumis à la TMP',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '160',
        nature: 'CA',
        libelle: 'Chiffre d’affaires exonéré',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '161',
        nature: 'CA',
        libelle: 'Total chiffres d’affaires exonérés',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '165',
        nature: 'CA',
        libelle: 'Chiffre d’affaires dont TVA collectée en amont',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '170',
        nature: 'CA',
        libelle: 'Chiffre d’affaires total de la période',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '180',
        nature: 'CA',
        libelle: 'Chiffre d affaires ou Produits aux fins de régularisation des TVA indiquées à la ligne 270',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      ///////::::::::::::::::::::::::::::::
      {
        code: '200',
        nature: 'COLL',
        libelle: 'TVA collectée (Gaz butane, Pates alimentaire de fabrication locale) [L102*5%]',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '205',
        nature: 'COLL',
        libelle: 'TVA collectée (Supercarburant titrant 95 indice d octane et plus , Gas-oil)[L103*15%]',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '210',
        nature: 'COLL',
        libelle: 'TVA collectée [lignes (105 + 106 +107 + 108 + 115 + 125) x 20%]',
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
        libelle: 'TVA collectée non encore encaissée sur Marchés publics (140*taux)',
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
        code: '274',
        nature: 'COLL',
        libelle: 'TVA collectée restant à encaisser sur Marchés publics à reporter (271+272-273)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '275',
        nature: 'COLL',
        libelle: 'TVA collectée durant la période (lignes 200 +205 + 210 + 270 + 273)',
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
        code: '310',
        nature: 'DED',
        libelle: 'TVA déductible sur les biens locaux destinés à la revente (300 + 305)',
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
      {
        code: '360',
        nature: 'DED',
        libelle: 'Total TVA déductibles autres que sur invest éligibles aux fins du calc de prorata de déduc (315+316+335+340+345+350+355+359)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '365',
        nature: 'DED',
        libelle: 'Taux du prorata de déduction (en termes de pourcentage et suivant le CA de l\'année précédente)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '366',
        nature: 'DED',
        libelle: 'TVA déductible autres que sur investissements éligibles selon le prorata de déduction : (360*365) + 338',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '368',
        nature: 'DED',
        libelle: 'TVA déductible sur investissements éligibles aux fins du calcul du prorata de déduction (320+330)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '370',
        nature: 'DED',
        libelle: 'TVA déductible sur investissements éligibles selon le prorata de déduction (368*365)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: '375',
        nature: 'DED',
        libelle: 'TVA déductible pour la période (310 +366 + 370)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('listecodetvas', null, {});
  }
};
