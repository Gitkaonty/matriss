/**
 * Script de création des indexes pour optimiser l'import
 * Exécuter avec: node api/scripts/addIndexes.js
 */

const { sequelize } = require('../Models');

async function addIndexes() {
  console.log('Création des indexes pour optimisation...');
  
  try {
    // Indexes pour journals (table principale de l'import)
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_journals_compte_dossier_exercice 
      ON journals(id_compte, id_dossier, id_exercice);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_journals_journal 
      ON journals(id_journal);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_journals_numcpt 
      ON journals(id_numcpt);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_journals_numcptcentralise 
      ON journals(id_numcptcentralise);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_journals_dateecriture 
      ON journals(dateecriture);
    `);

    // Indexes pour codejournals
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_codejournals_compte_dossier 
      ON codejournals(id_compte, id_dossier);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_codejournals_code 
      ON codejournals(code);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_codejournals_type 
      ON codejournals(type);
    `);

    // Indexes pour dossierplancomptables
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_dossierpc_compte_dossier 
      ON dossierplancomptables(id_compte, id_dossier);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_dossierpc_compte_num 
      ON dossierplancomptables(compte);
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_dossierpc_baseaux 
      ON dossierplancomptables(baseaux_id);
    `);

    console.log('✅ Tous les indexes ont été créés avec succès !');
    console.log('L\'import devrait maintenant être beaucoup plus rapide.');
    
  } catch (err) {
    console.error('❌ Erreur lors de la création des indexes:', err);
  } finally {
    await sequelize.close();
  }
}

addIndexes();
