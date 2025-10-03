// api/migrations/20250911102000-seed-formulaire-tva-annexes-matrices-commons.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = Sequelize.fn('NOW');
    const rows = [
      // 100
      { id_code: 100, libelle: "Chiffre d’affaires taxable relatif aux exportations (taux 0%)", groupe: '01', createdAt: now, updatedAt: now },

      // 102
      { id_code: 102, libelle: "Chiffre d’affaire taxable 5% (Gaz butane, Pates alimentaire de fabrication locale)", groupe: '01', createdAt: now, updatedAt: now },

      // 103
      { id_code: 103, libelle: "Chiffre d’affaire taxable 15% (Supercarburant titrant 95 indice d’octane et plus , Gas-oil)", groupe: '01', createdAt: now, updatedAt: now },

      // 105
      { id_code: 105, libelle: "Chiffre d’affaires taxable sur les opérations transport terrestre de marchandises/hydrocarbures (taux 20%)", groupe: '01', createdAt: now, updatedAt: now },

      // 106
      { id_code: 106, libelle: "Chiffre d'affaires taxable sur les ventes des biens", groupe: '01', createdAt: now, updatedAt: now },

      // 107
      { id_code: 107, libelle: "Chiffre d'affaires taxable sur les prestations de services", groupe: '01', createdAt: now, updatedAt: now },

      // 108
      { id_code: 108, libelle: "Chiffre d'affaires taxable sur les travaux immobiliers", groupe: '01', createdAt: now, updatedAt: now },

      // 115
      { id_code: 115, libelle: "Produits de cession d'immobilisations (taux 20%)", groupe: '01', createdAt: now, updatedAt: now },

      // 125
      { id_code: 125, libelle: "Montant des livraisons à soi-même (taux 20%)", groupe: '01', createdAt: now, updatedAt: now },

      // 130
      { id_code: 130, libelle: "Chiffre d’affaires objet d'une Attestation de destination (AD)", groupe: '01', createdAt: now, updatedAt: now },

      // 140
      { id_code: 140, libelle: "Chiffre d’affaires taxable s/Marchés publics dont la TVA est encore non encaissée", groupe: '01', createdAt: now, updatedAt: now },

      // 150 (total, mais sans formula pour l’instant)
      { id_code: 150, libelle: "Montant total des affaires taxables (lignes 100+102+103+105+106+107+108+115+125+130+140)", groupe: '01', createdAt: now, updatedAt: now },

      // 155
      { id_code: 155, libelle: "Chiffre d'affaires sur Marchés publics soumis à la TMP", groupe: '01', createdAt: now, updatedAt: now },

      // 160
      { id_code: 160, libelle: "Chiffre d’affaires exonéré", groupe: '01', createdAt: now, updatedAt: now },

      // 161 (total)
      { id_code: 161, libelle: "Total chiffres d'affaires exonérés (155+ 160)", groupe: '01', createdAt: now, updatedAt: now },

      // 165
      { id_code: 165, libelle: "Chiffre d’affaires dont TVA collectée en amont", groupe: '01', createdAt: now, updatedAt: now },

      // 170 (total)
      { id_code: 170, libelle: "Chiffre d'affaires total de la période : lignes 100+102+103+105+106+107+108+130+140+161+165", groupe: '01', createdAt: now, updatedAt: now },

      // 180
      { id_code: 180, libelle: "Chiffre d'affaires ou Produits aux fins de régularisation des TVA indiquées à la ligne 270", groupe: '01', createdAt: now, updatedAt: now },

      // Groupe 2 (DGE groupe '02', CFISC sans groupe)

    // 200
    { id_code: 200, libelle: "TVA Collectée (Gaz butane, Pates alimentaire de fabrication locale) [L102*5%]", groupe: '02', createdAt: now, updatedAt: now },

    // 205
    { id_code: 205, libelle: "TVA Collectée (Supercarburant titrant 95 indice d’octane et plus , Gas-oil)[L103*15%)]", groupe: '02', createdAt: now, updatedAt: now },

    // 210
    { id_code: 210, libelle: "TVA collectée [lignes (105 + 106 +107 + 108 + 115 + 125) x 20%]", groupe: '02', createdAt: now, updatedAt: now },

    // 270
    { id_code: 270, libelle: "Autres TVA collectées sur régularisations", groupe: '02', createdAt: now, updatedAt: now },

    // 271
    { id_code: 271, libelle: "TVA collectée non encore encaissée sur Marchés publics (140*taux)", groupe: '02', createdAt: now, updatedAt: now },

    // 272
    { id_code: 272, libelle: "Report - TVA collectée non encore encaissée sur Marchés publics", groupe: '02', createdAt: now, updatedAt: now },
  
    // 273
    { id_code: 273, libelle: "TVA collectée encaissée sur Marchés publics de la période", groupe: '02', createdAt: now, updatedAt: now },
  
    // 274
    { id_code: 274, libelle: "TVA collectée restant à encaisser sur Marchés publics à reporter (271+272-273)", groupe: '02', createdAt: now, updatedAt: now },
  
    // 275
    { id_code: 275, libelle: "TVA collectée durant la période (lignes 200 +205 + 210 + 270 + 273)", groupe: '02', createdAt: now, updatedAt: now },
  
  // Groupe 3 (DGE groupe '03', CFISC sans groupe)

    { id_code: 300, libelle: "TVA déductible sur les biens locaux destinés à la revente", groupe: '03', createdAt: now, updatedAt: now },
    { id_code: 305, libelle: "TVA déductibles sur les biens importés destinés à la revente", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 310, libelle: "TVA déductible sur les biens destinés à la revente (300 + 305)", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 315, libelle: "TVA déductible sur investissements incorporels (importés et/ou locaux) : non éligibles", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 316, libelle: "TVA déductible sur investissements corporels locaux non éligibles", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 320, libelle: "TVA déductible sur investissements corporels locaux éligibles", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 330, libelle: "TVA déductible sur investissements corporels importés éligibles", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 335, libelle: "TVA déductible sur investissements corporels importés non éligibles", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 338, libelle: "TVA déductible sur achats gazole liés aux opérations de transport terrestre de marchandises et hydrocarbures", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 340, libelle: "TVA déductible sur les autres biens locaux", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 345, libelle: "TVA déductible sur les autres biens importés", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 350, libelle: "TVA déductible sur les services locaux", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 355, libelle: "TVA déductible sur les services importés", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 359, libelle: "Régularisation TVA déductibles sur acquisitions de biens, services et d’équipements/immeubles (+ ou -)", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 360, libelle: "Total TVA déductibles autres que sur invest éligibles aux fins du calc de prorata de déduc (315+316+335+340+345+350+355+359)", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 365, libelle: "Taux du prorata de déduction (en termes de pourcentage et suivant le CA de l'année précédente)", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 366, libelle: "TVA déductible autres que sur investissements éligibles selon le prorata de déduction : (360*365) + 338", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 368, libelle: "TVA déductible sur investissements éligibles aux fins du calcul du prorata de déduction (320+330)", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 370, libelle: "TVA déductible sur investissements éligibles selon le prorata de déduction (368*365)", groupe: '03', createdAt: now, updatedAt: now },
  
    { id_code: 375, libelle: "TVA déductible pour la période (310 +366 + 370)", groupe: '03', createdAt: now, updatedAt: now },

  
  // Groupe 4 (DGE groupe '04', CFISC sans groupe)
    { id_code: 400, libelle: "Crédit de TVA du mois [ligne (375 – 275)", groupe: '04', createdAt: now, updatedAt: now },
  
    { id_code: 579, libelle: "Régularisation des TVA déductibles après application du prorata définitif (en + ou en -)", groupe: '04', createdAt: now, updatedAt: now },
  
    { id_code: 589, libelle: "Autres régularisations des TVA sur les biens destinés à la revente (en + ou en -)", groupe: '04', createdAt: now, updatedAt: now },
  
    { id_code: 610, libelle: "Crédit reportable de la période précédente ou crédit d'ouverture", groupe: '04', createdAt: now, updatedAt: now },
  
    { id_code: 620, libelle: "Crédit de TVA annulé suite à un contrôle (réservé à l'Administration fiscale)", groupe: '04', createdAt: now, updatedAt: now },
  
    { id_code: 630, libelle: "Crédit de TVA demandé en remboursement au cours de la période", groupe: '04', createdAt: now, updatedAt: now },
  
    { id_code: 635, libelle: "Crédit TVA non demandé en remboursement dans le délai légal", groupe: '04', createdAt: now, updatedAt: now },
  
    { id_code: 640, libelle: "Crédit de TVA rejeté au cours de la période mais encore imputable", groupe: '04', createdAt: now, updatedAt: now },
  
    { id_code: 660, libelle: "Report de crédit imputé dans la période", groupe: '04', createdAt: now, updatedAt: now },
  
    { id_code: 670, libelle: "Crédit de TVA transféré en charge au cours de la période", groupe: '04', createdAt: now, updatedAt: now },

  
  // Groupe 5 (DGE groupe '05', CFISC sans groupe)

    { id_code: 700, libelle: "TVA nette à payer à la fin de la période : (275 + 620) - (375+579+589+635+640+660)", groupe: '05', createdAt: now, updatedAt: now },
  
    { id_code: 701, libelle: "Crédit à reporter 610 + 400 +579 + 589 + 640 - 620- 630 - 670", groupe: '05', createdAt: now, updatedAt: now },
  ];

    // Build a unique list with a single row per id_code and without 'type'.
    // Preference goes to the first occurrence (DGE rows come first and carry 'groupe').
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.id_code)) {
        map.set(r.id_code, {
          id_code: r.id_code,
          libelle: r.libelle,
          groupe: r.groupe ?? null,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        });
      }
    }
    const uniqueRows = Array.from(map.values());

    // Insert prepared rows
    await queryInterface.bulkInsert('formulaire_tva_annexes_matrices', uniqueRows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('formulaire_tva_annexes_matrices', {
      id_code: { [require('sequelize').Op.in]:[100,102,103,105,106,107,108,115,125,130,140,150,155,160,161,165,170,180,
        200,205,210,270,271,272,273,274,275,
        300,305,310,315,316,320,330,335,338,340,345,350,355,359,360,365,366,368,370,375,
        400,579,589,610,620,630,635,640,660,670,
        700,701] }
    });
  }
};