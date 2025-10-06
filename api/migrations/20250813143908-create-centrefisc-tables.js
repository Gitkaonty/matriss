'use strict';

module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable('etatscentresfiscales', {
          id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            unique: true,
            primaryKey:true,
            autoIncrement:true
          },
          id_cfisc: {
                type: Sequelize.BIGINT,
                allowNull: false
            },
         libelle: {
            type: Sequelize.STRING(250),
            unique: false,
            allowNull: false
        },
        montant: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0,
            unique: false,
            allowNull: false
        },
        id_compte: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'userscomptes',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        id_dossier: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'dossiers',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        id_exercice: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue: 0,
          references: {
            model: 'exercices',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
        },
        },
        {timestamps: true}
        );
    },

    async down (queryInterface, Sequelize) {
        await queryInterface.dropTable('etatscentresfiscales');
    }
}