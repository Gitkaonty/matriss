const { Sequelize } = require('sequelize');
const path = require('path');
const config = require(path.join(__dirname, '..', 'config', 'config.json')).development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: console.log
});

async function checkAndAddColumn() {
  try {
    // Vérifier si la colonne existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'table_revisions_controles' 
      AND column_name = 'id_periode'
    `);
    
    if (results.length === 0) {
      console.log('Colonne id_periode non trouvée, ajout en cours...');
      await sequelize.query(`
        ALTER TABLE table_revisions_controles 
        ADD COLUMN id_periode INTEGER
      `);
      console.log('Colonne id_periode ajoutée avec succès !');
    } else {
      console.log('Colonne id_periode existe déjà.');
    }
    
    // Vérifier aussi pour id_num_compte
    const [results2] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'table_controle_anomalies' 
      AND column_name = 'id_num_compte'
    `);
    
    if (results2.length === 0) {
      console.log('Colonne id_num_compte non trouvée, ajout en cours...');
      await sequelize.query(`
        ALTER TABLE table_controle_anomalies 
        ADD COLUMN id_num_compte VARCHAR(50)
      `);
      console.log('Colonne id_num_compte ajoutée avec succès !');
    } else {
      console.log('Colonne id_num_compte existe déjà.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

checkAndAddColumn();
