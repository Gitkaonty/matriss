'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Ajouter id_controle (VARCHAR pour correspondre à id_controle dans table_controle_anomalies)
    await queryInterface.addColumn('revision_commentaire_anomalies', 'id_controle', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Ajouter id_jnl (STRING pour correspondre à id_jnl)
    await queryInterface.addColumn('revision_commentaire_anomalies', 'id_jnl', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Créer un index unique sur la combinaison id_compte, id_dossier, id_exercice, id_controle, id_jnl
    await queryInterface.addIndex('revision_commentaire_anomalies', 
      ['id_compte', 'id_dossier', 'id_exercice', 'id_controle', 'id_jnl'], 
      { 
        unique: true, 
        name: 'unique_commentaire_controle_jnl',
        where: { id_controle: { [Sequelize.Op.ne]: null } }
      }
    );

    // Migrer les données existantes: récupérer id_controle et id_jnl depuis table_controle_anomalies
    await queryInterface.sequelize.query(`
      UPDATE revision_commentaire_anomalies c
      SET id_controle = a.id_controle,
          id_jnl = a.id_jnl
      FROM table_controle_anomalies a
      WHERE c.id_anomalie = a.id
    `);

    console.log('Migration ajout id_controle et id_jnl terminée');
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('revision_commentaire_anomalies', 'unique_commentaire_controle_jnl');
    await queryInterface.removeColumn('revision_commentaire_anomalies', 'id_controle');
    await queryInterface.removeColumn('revision_commentaire_anomalies', 'id_jnl');
  }
};
