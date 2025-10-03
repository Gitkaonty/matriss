'use strict';

module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable('dgematrices', {
            id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                primaryKey:true,
                autoIncrement:true
            },
            id_dge: {
                type: Sequelize.BIGINT,
                allowNull: false,
                unique: true,
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
        await queryInterface.dropTable('dgematrices');
    }
};