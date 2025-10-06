'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('pays', [
      {
        code: 'AFG',
        nompays: 'Afghanistan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ALB',
        nompays: 'Albanie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ATA',
        nompays: 'Antarctique',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DZA',
        nompays: 'Algérie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ASM',
        nompays: 'Samoa Américaines',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'AND',
        nompays: 'Andorre',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'AGO',
        nompays: 'Angola',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ATG',
        nompays: 'Antigua-et-Barbuda',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'AZE',
        nompays: 'Azerbaïdjan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ARG',
        nompays: 'Argentine',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'AUS',
        nompays: 'Australie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'AUT',
        nompays: 'Autriche',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BHS',
        nompays: 'Bahamas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BHR',
        nompays: 'Bahreïn',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BGD',
        nompays: 'Bangladesh',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ARM',
        nompays: 'Arménie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BRB',
        nompays: 'Barbade',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BEL',
        nompays: 'Belgique',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BMU',
        nompays: 'Bermudes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BTN',
        nompays: 'Bhoutan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BOL',
        nompays: 'Bolivie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BIH',
        nompays: 'Bosnie-Herzégovine',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BWA',
        nompays: 'Botswana',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BVT',
        nompays: 'Île Bouvet',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BRA',
        nompays: 'Brésil',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BLZ',
        nompays: 'Belize',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IOT',
        nompays: 'Territoire Britannique de l\'Océan Indien',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SLB',
        nompays: 'Îles Salomon',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'VGB',
        nompays: 'Îles Vierges Britanniques',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BRN',
        nompays: 'Brunéi Darussalam',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BGR',
        nompays: 'Bulgarie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MMR',
        nompays: 'Myanmar',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BDI',
        nompays: 'Burundi',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BLR',
        nompays: 'Bélarus',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'KHM',
        nompays: 'Cambodge',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CMR',
        nompays: 'Cameroun',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CAN',
        nompays: 'Canada',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CPV',
        nompays: 'Cap-vert',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CYM',
        nompays: 'Îles Caïmanes',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CAF',
        nompays: 'République Centrafricaine',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LKA',
        nompays: 'Sri Lanka',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TCD',
        nompays: 'Tchad',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CHL',
        nompays: 'Chili',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CHN',
        nompays: 'Chine',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TWN',
        nompays: 'Taïwan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CXR',
        nompays: 'Île Christmas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CCK',
        nompays: 'Îles Cocos (Keeling)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'COL',
        nompays: 'Colombie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'COM',
        nompays: 'Comores',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MYT',
        nompays: 'Mayotte',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'COG',
        nompays: 'République du Congo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'COD',
        nompays: 'République Démocratique du Congo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'COK',
        nompays: 'Îles Cook',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CRI',
        nompays: 'Costa Rica',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'HRV',
        nompays: 'Croatie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CUB',
        nompays: 'Cuba',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CYP',
        nompays: 'Chypre',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CZE',
        nompays: 'République Tchèque',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BEN',
        nompays: 'Bénin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DNK',
        nompays: 'Danemark',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DMA',
        nompays: 'Dominique',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DOM',
        nompays: 'République Dominicaine',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ECU',
        nompays: 'Equateur',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SLV',
        nompays: 'El Salvador',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GNQ',
        nompays: 'Guinée Equatoriale',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ETH',
        nompays: 'Ethiopie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ERI',
        nompays: 'Erythrée',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'EST',
        nompays: 'Estonie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'FRO',
        nompays: 'Îles Féroé',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'FLK',
        nompays: 'Îles (malvinas) Falkland',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SGS',
        nompays: 'Géorgie du Sud et les Îles Sandwich du Sud',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'FJI',
        nompays: 'Fidji',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'FIN',
        nompays: 'Finlande',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ALA',
        nompays: 'Îles island',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'FRA',
        nompays: 'France',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GUF',
        nompays: 'Guyane Française',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PYF',
        nompays: 'Polynésie Française',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ATF',
        nompays: 'Terres Australes Françaises',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DJI',
        nompays: 'Djibouti',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GAB',
        nompays: 'Gabon',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GEO',
        nompays: 'Géorgie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GMB',
        nompays: 'Gambie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PSE',
        nompays: 'Territoire Palestinien Occupé',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'DEU',
        nompays: 'Allemagne',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GHA',
        nompays: 'Ghana',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GIB',
        nompays: 'Gibraltar',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'KIR',
        nompays: 'Kiribati',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GRC',
        nompays: 'Grèce',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GRL',
        nompays: 'Groenland',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GRD',
        nompays: 'Grenade',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GLP',
        nompays: 'Guadeloupe',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GUM',
        nompays: 'Guam',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GTM',
        nompays: 'Guatemala',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GIN',
        nompays: 'Guinée',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GUY',
        nompays: 'Guyana',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'HTI',
        nompays: 'Haïti',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'HMD',
        nompays: 'Îles Heard et Mcdonald',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'VAT',
        nompays: 'Saint-Siège (état de la Cité du Vatican)',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'HND',
        nompays: 'Honduras',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'HKG',
        nompays: 'Hong-Kong',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'HUN',
        nompays: 'Hongrie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ISL',
        nompays: 'Islande',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IND',
        nompays: 'Inde',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IDN',
        nompays: 'Indonésie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IRN',
        nompays: 'République Islamique d\'Iran',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IRQ',
        nompays: 'Iraq',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IRL',
        nompays: 'Irlande',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ISR',
        nompays: 'Israël',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ITA',
        nompays: 'Italie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CIV',
        nompays: 'Côte d\'Ivoire',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'JAM',
        nompays: 'Jamaïque',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'JPN',
        nompays: 'Japon',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'KAZ',
        nompays: 'Kazakhstan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'JOR',
        nompays: 'Jordanie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'KEN',
        nompays: 'Kenya',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PRK',
        nompays: 'République Populaire Démocratique de Corée',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'KOR',
        nompays: 'République de Corée',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'KWT',
        nompays: 'Koweït',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'KGZ',
        nompays: 'Kirghizistan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LAO',
        nompays: 'République Démocratique Populaire Lao',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LBN',
        nompays: 'Liban',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LSO',
        nompays: 'Lesotho',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LVA',
        nompays: 'Lettonie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LBR',
        nompays: 'Libéria',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LBY',
        nompays: 'Jamahiriya Arabe Libyenne',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LIE',
        nompays: 'Liechtenstein',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LTU',
        nompays: 'Lituanie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LUX',
        nompays: 'Luxembourg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MAC',
        nompays: 'Macao',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MDG',
        nompays: 'Madagascar',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MWI',
        nompays: 'Malawi',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MYS',
        nompays: 'Malaisie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MDV',
        nompays: 'Maldives',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MLI',
        nompays: 'Mali',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MLT',
        nompays: 'Malte',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MTQ',
        nompays: 'Martinique',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MRT',
        nompays: 'Mauritanie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MUS',
        nompays: 'Maurice',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MEX',
        nompays: 'Mexique',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MCO',
        nompays: 'Monaco',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MNG',
        nompays: 'Mongolie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MDA',
        nompays: 'République de Moldova',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MSR',
        nompays: 'Montserrat',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MAR',
        nompays: 'Maroc',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MOZ',
        nompays: 'Mozambique',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'OMN',
        nompays: 'Oman',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NAM',
        nompays: 'Namibie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NRU',
        nompays: 'Nauru',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NPL',
        nompays: 'Népal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NLD',
        nompays: 'Pays-Bas',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ANT',
        nompays: 'Antilles Néerlandaises',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ABW',
        nompays: 'Aruba',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NCL',
        nompays: 'Nouvelle-Calédonie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'VUT',
        nompays: 'Vanuatu',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NZL',
        nompays: 'Nouvelle-Zélande',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NIC',
        nompays: 'Nicaragua',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NER',
        nompays: 'Niger',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NGA',
        nompays: 'Nigéria',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NIU',
        nompays: 'Niué',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NFK',
        nompays: 'Île Norfolk',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'NOR',
        nompays: 'Norvège',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MNP',
        nompays: 'Îles Mariannes du Nord',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'UMI',
        nompays: 'Îles Mineures Eloignées des Etats-Unis',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'FSM',
        nompays: 'Etats Fédérés de Micronésie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MHL',
        nompays: 'Îles Marshall',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PLW',
        nompays: 'Palaos',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PAK',
        nompays: 'Pakistan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PAN',
        nompays: 'Panama',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PNG',
        nompays: 'Papouasie-Nouvelle-Guinée',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PRY',
        nompays: 'Paraguay',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PER',
        nompays: 'Pérou',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PHL',
        nompays: 'Philippines',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PCN',
        nompays: 'Pitcairn',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'POL',
        nompays: 'Pologne',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PRT',
        nompays: 'Portugal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GNB',
        nompays: 'Guinée-Bissau',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TLS',
        nompays: 'Timor-Leste',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PRI',
        nompays: 'Porto Rico',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'QAT',
        nompays: 'Qatar',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'REU',
        nompays: 'Réunion',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ROU',
        nompays: 'Roumanie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'RUS',
        nompays: 'Fédération de Russie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'RWA',
        nompays: 'Rwanda',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SHN',
        nompays: 'Sainte-Hélène',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'KNA',
        nompays: 'Saint-Kitts-et-Nevis',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'AIA',
        nompays: 'Anguilla',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'LCA',
        nompays: 'Sainte-Lucie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SPM',
        nompays: 'Saint-Pierre-et-Miquelon',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'VCT',
        nompays: 'Saint-Vincent-et-les Grenadines',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SMR',
        nompays: 'Saint-Marin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'STP',
        nompays: 'Sao Tomé-et-Principe',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SAU',
        nompays: 'Arabie Saoudite',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SEN',
        nompays: 'Sénégal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SYC',
        nompays: 'Seychelles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SLE',
        nompays: 'Sierra Leone',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SGP',
        nompays: 'Singapour',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SVK',
        nompays: 'Slovaquie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'VNM',
        nompays: 'Viet Nam',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SVN',
        nompays: 'Slovénie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SOM',
        nompays: 'Somalie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ZAF',
        nompays: 'Afrique du Sud',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ZWE',
        nompays: 'Zimbabwe',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ESP',
        nompays: 'Espagne',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ESH',
        nompays: 'Sahara Occidental',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SDN',
        nompays: 'Soudan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SUR',
        nompays: 'Suriname',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SJM',
        nompays: 'Svalbard etÎle Jan Mayen',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SWZ',
        nompays: 'Swaziland',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SWE',
        nompays: 'Suède',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CHE',
        nompays: 'Suisse',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SYR',
        nompays: 'République Arabe Syrienne',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TJK',
        nompays: 'Tadjikistan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'THA',
        nompays: 'Thaïlande',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TGO',
        nompays: 'Togo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TKL',
        nompays: 'Tokelau',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TON',
        nompays: 'Tonga',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TTO',
        nompays: 'Trinité-et-Tobago',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ARE',
        nompays: 'Emirats Arabes Unis',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TUN',
        nompays: 'Tunisie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TUR',
        nompays: 'Turquie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TKM',
        nompays: 'Turkménistan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TCA',
        nompays: 'Îles Turks et Caïques',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TUV',
        nompays: 'Tuvalu',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'UGA',
        nompays: 'Ouganda',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'UKR',
        nompays: 'Ukraine',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'MKD',
        nompays: 'L\'ex-République Yougoslave de Macédoine',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'EGY',
        nompays: 'Egypte',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'GBR',
        nompays: 'Royaume-Uni',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IMN',
        nompays: 'Île de Man',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'TZA',
        nompays: 'République-Unie de Tanzanie',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'USA',
        nompays: 'Etats-Unis',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'VIR',
        nompays: 'Îles Vierges des Etats-Unis',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BFA',
        nompays: 'Burkina Faso',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'URY',
        nompays: 'Uruguay',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'UZB',
        nompays: 'Ouzbékistan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'VEN',
        nompays: 'Venezuela',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'WLF',
        nompays: 'Wallis et Futuna',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'WSM',
        nompays: 'Samoa',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'YEM',
        nompays: 'Yémen',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SCG',
        nompays: 'Serbie-et-Monténégro',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'ZMB',
        nompays: 'Zambie',
        createdAt: new Date(),
        updatedAt: new Date()
      },



    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('pays', null, {});
  }
};
