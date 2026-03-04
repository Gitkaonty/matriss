'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Vérifier si la contrainte existe déjà
    const constraints = await queryInterface.showConstraint('revision_commentaire_anomalies');
    const hasUniqueConstraint = constraints.some(c => 
      c.constraintType === 'UNIQUE' && 
      c.constraintName === 'unique_commentaire_anomalie'
    );

    if (!hasUniqueConstraint) {
      // Supprimer l'index s'il existe (pour éviter les conflits)
      try {
        await queryInterface.removeIndex('revision_commentaire_anomalies', 'unique_commentaire_anomalie');
      } catch (e) {
        // Ignorer l'erreur si l'index n'existe pas
      }

      // Ajouter la contrainte unique
      await queryInterface.addConstraint('revision_commentaire_anomalies', {
        fields: ['id_compte', 'id_dossier', 'id_exercice', 'id_anomalie'],
        type: 'unique',
        name: 'unique_commentaire_anomalie'
      });
      
      console.log('Contrainte unique ajoutée sur revision_commentaire_anomalies');
    }
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('revision_commentaire_anomalies', 'unique_commentaire_anomalie');
  }
};
