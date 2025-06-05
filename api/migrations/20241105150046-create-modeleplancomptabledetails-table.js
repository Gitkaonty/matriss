'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('modeleplancomptabledetails', {
      id_compte: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue:0
      },
      id_modeleplancomptable: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue:0
      },
      compte: {
          type: Sequelize.STRING(50),
          allowNull: true
      },
      libelle: {
          type: Sequelize.STRING(150),
          allowNull: true
      },
      nature: {
          type: Sequelize.STRING(20),
          allowNull: true
      },
      baseaux: {
          type: Sequelize.STRING(20),
          allowNull: true
      },
      cptcharge: {
          type: Sequelize.INTEGER,
          allowNull: true,
          autocompletion: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue:true
        },
      },
      typetier: {
          type: Sequelize.STRING(15),
          allowNull: true
      },
      cpttva: {
          type: Sequelize.INTEGER,
          allowNull: true,
          autocompletion: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue:true
        },
      },
      nif: {
          type: Sequelize.STRING(20),
          allowNull: true
      },
      statistique: {
          type: Sequelize.STRING(20),
          allowNull: true
      },
      adresse: {
          type: Sequelize.STRING(200),
          allowNull: true
      },
      motcle: {
          type: Sequelize.STRING(50),
          allowNull: true
      },
      cin: {
          type: Sequelize.STRING(15),
          allowNull: true
      },
      datecin: {
          type: Sequelize.DATE,
          allowNull: true
      },
      autrepieceid: {
          type: Sequelize.STRING(50),
          allowNull: true
      },
      refpieceid: {
          type: Sequelize.STRING(50),
          allowNull: true
      },
      adressesansnif: {
          type: Sequelize.STRING(150),
          allowNull: true
      },
      nifrepresentant: {
          type: Sequelize.STRING(50),
          allowNull: true
      },
      adresseetranger: {
          type: Sequelize.STRING(150),
          allowNull: true
      },
      pays: {
          type: Sequelize.STRING(50),
          allowNull: true
      },
      baseaux_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue:0
      },
    },
    {timestamps: true}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('modeleplancomptabledetails');
  }
};
