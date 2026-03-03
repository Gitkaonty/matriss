const { Sequelize } = require('sequelize');
const path = require('path');
const config = require(path.join(__dirname, '..', 'config', 'config.json')).development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: console.log
});

async function fixPeriodes() {
  try {
    // Vérifier les périodes existantes
    const [periodes] = await sequelize.query(`
      SELECT id, id_compte, id_dossier, id_exercice, libelle, date_debut, date_fin 
      FROM periodes 
      WHERE id_exercice = 166
    `);
    
    console.log('Périodes trouvées pour exercice 166:');
    periodes.forEach(p => {
      console.log(`  id=${p.id}, id_compte=${p.id_compte}, id_dossier=${p.id_dossier}, dates: ${p.date_debut} à ${p.date_fin}`);
    });
    
    // Corriger la période id=4 si nécessaire
    const periode4 = periodes.find(p => p.id === 4);
    if (periode4 && periode4.id_compte === 134 && periode4.id_dossier === 134) {
      console.log('\nCorrection de la période id=4...');
      await sequelize.query(`
        UPDATE periodes 
        SET id_compte = 1, id_dossier = 134 
        WHERE id = 4
      `);
      console.log('Période corrigée: id_compte=1, id_dossier=134');
    }
    
    // Vérifier d'autres périodes avec le même problème
    const periodesIncorrectes = periodes.filter(p => p.id_compte === p.id_dossier && p.id_compte !== 1);
    if (periodesIncorrectes.length > 0) {
      console.log(`\n${periodesIncorrectes.length} périodes avec id_compte=id_dossier (probablement incorrect):`);
      for (const p of periodesIncorrectes) {
        console.log(`  id=${p.id}: id_compte=${p.id_compte}, id_dossier=${p.id_dossier}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

fixPeriodes();
