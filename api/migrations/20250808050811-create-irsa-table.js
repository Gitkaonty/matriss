'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('irsas', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      personnelId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'personnels', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      matricule: { type: Sequelize.STRING, allowNull: true },
      indemniteImposable: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      indemniteNonImposable: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      avantageImposable: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      avantageExonere: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      salaireBase: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      heuresSupp: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      primeGratification: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      autres: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      salaireBrut: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      cnapsRetenu: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      ostie: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      salaireNet: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      autreDeduction: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      montantImposable: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      impotCorrespondant: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      reductionChargeFamille: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
      impotDu: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
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
      nom: {
        type: Sequelize.STRING, allowNull: true
      },
      prenom: {
        type: Sequelize.STRING, allowNull: true
      },
      cnaps: {
        type: Sequelize.STRING, allowNull: true
      },
      cin: {
        type: Sequelize.STRING, allowNull: true
      },
      fonction: {
        type: Sequelize.STRING, allowNull: true
      },
      dateEntree: {
        type: Sequelize.STRING, allowNull: true
      },
      dateSortie: {
        type: Sequelize.STRING, allowNull: true
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('irsas');
  }
}; 