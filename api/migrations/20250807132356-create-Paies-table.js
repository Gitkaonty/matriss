'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('paies', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },

      personnelId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'personnels', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      matricule: { type: Sequelize.STRING, allowNull: true },

      salaireBase: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      prime: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      heuresSup: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      indemnites: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      remunerationFerieDimanche: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      salaireBrutNumeraire: { type: Sequelize.DECIMAL(15, 2), allowNull: true },

      assurance: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      carburant: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      entretienReparation: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      totalDepensesVehicule: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      totalAvantageNatureVehicule: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      loyerMensuel: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      remunerationFixe25: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      avantageNatureLoyer: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      depenseTelephone: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      avantageNatureTelephone: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      autresAvantagesNature: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      totalAvantageNature: { type: Sequelize.DECIMAL(15, 2), allowNull: true },

      salaireBrut20: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      cnapsEmployeur: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      baseImposable: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      ostieEmployeur: { type: Sequelize.DECIMAL(15, 2), allowNull: true },

      mois: { type: Sequelize.INTEGER, allowNull: true },
      annee: { type: Sequelize.INTEGER, allowNull: true },
      id_dossier: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dossiers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_exercice: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'exercices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_compte: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'userscomptes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      totalSalaireBrut: {
        type: Sequelize.DECIMAL(15, 2), allowNull: true
      },
      irsaBrut: {
        type: Sequelize.DECIMAL(15, 2), allowNull: true
      },
      deductionEnfants: {
        type: Sequelize.DECIMAL(15, 2), allowNull: true
      },
      irsaNet: {
        type: Sequelize.DECIMAL(15, 2), allowNull: true
      },
      salaireNet: {
        type: Sequelize.DECIMAL(15, 2), allowNull: true
      },
      avanceQuinzaineAutres: {
        type: Sequelize.DECIMAL(15, 2), allowNull: true
      },
      avancesSpeciales: {
        type: Sequelize.DECIMAL(15, 2), allowNull: true
      },
      allocationFamiliale: {
        type: Sequelize.DECIMAL(15, 2), allowNull: true
      },
      netAPayerAriary: {
        type: Sequelize.DECIMAL(15, 2), allowNull: true
      },
      partPatronalCnaps: {
        type: Sequelize.DECIMAL(15, 2), allowNull: true
      },
      partPatronalOstie: {
        type: Sequelize.DECIMAL(15, 2), allowNull: true
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('paies');
  }
};
