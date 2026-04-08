'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Ajouter la colonne statut
        await queryInterface.addColumn('dossier_revision', 'statut', {
            type: Sequelize.STRING(10),
            allowNull: true,
            validate: {
                isIn: [['OUI', 'NON', 'NA']]
            }
        });

        // Migrer les données existantes: true -> 'OUI', false -> 'NON'
        await queryInterface.sequelize.query(`
            UPDATE dossier_revision 
            SET statut = CASE 
                WHEN valider = true THEN 'OUI'
                ELSE 'NON'
            END
        `);

        // Supprimer l'ancienne colonne valider
        await queryInterface.removeColumn('dossier_revision', 'valider');

        // Ajouter un index sur statut
        await queryInterface.addIndex('dossier_revision', ['statut'], {
            name: 'idx_dossier_revision_statut',
        });
    },

    async down(queryInterface, Sequelize) {
        // Remettre la colonne valider
        await queryInterface.addColumn('dossier_revision', 'valider', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        // Migrer les données en arrière
        await queryInterface.sequelize.query(`
            UPDATE dossier_revision 
            SET valider = CASE 
                WHEN statut = 'OUI' THEN true
                ELSE false
            END
        `);

        // Supprimer statut
        await queryInterface.removeColumn('dossier_revision', 'statut');

        // Supprimer l'index
        await queryInterface.removeIndex('dossier_revision', 'idx_dossier_revision_statut');
    }
};
