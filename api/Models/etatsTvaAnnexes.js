module.exports = (sequelize, DataTypes) => {
  const EtatsTvaAnnexes = sequelize.define(
    'etatsTvaAnnexes',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      collecte_deductible: { type: DataTypes.STRING(50), allowNull: false },
      local_etranger: { type: DataTypes.STRING(50), allowNull: false },
      nif: { type: DataTypes.STRING(50), allowNull: false },
      raison_sociale: { type: DataTypes.STRING(250), allowNull: false },
      stat: { type: DataTypes.STRING(100), allowNull: false },
      adresse: { type: DataTypes.STRING(250), allowNull: false },
      montant_ht: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      montant_tva: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      reference_facture: { type: DataTypes.STRING(140), allowNull: false },
      date_facture: { type: DataTypes.DATEONLY, allowNull: false },
      nature: { type: DataTypes.STRING(120), allowNull: false },
      libelle_operation: { type: DataTypes.STRING(250), allowNull: false },
      date_paiement: { type: DataTypes.DATEONLY, allowNull: false },
      mois: { type: DataTypes.INTEGER, allowNull: false },
      annee: { type: DataTypes.INTEGER, allowNull: false },
      observation: { type: DataTypes.STRING(250), allowNull: false },
      n_dau: { type: DataTypes.STRING(120), allowNull: false },
      ligne_formulaire: { type: DataTypes.STRING(120), allowNull: false },
      id_compte: { type: DataTypes.BIGINT, allowNull: false },
      id_dossier: { type: DataTypes.BIGINT, allowNull: false },
      id_exercice: { type: DataTypes.BIGINT, allowNull: false },
      id_ecriture: { type: DataTypes.BIGINT, allowNull: false ,unique: true },
      id_numcpt: { type: DataTypes.BIGINT, allowNull: false },
      anomalies: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      commentaire: { type: DataTypes.TEXT, allowNull: true },
      code_tva: { type: DataTypes.STRING(50), allowNull: true },
    },
    {
      tableName: 'tva_annexes',
      timestamps: true,
    }
  );

  EtatsTvaAnnexes.associate = (db) => {
    EtatsTvaAnnexes.belongsTo(db.userscomptes, { foreignKey: 'id_compte', targetKey: 'id' });
    EtatsTvaAnnexes.belongsTo(db.dossiers, { foreignKey: 'id_dossier', targetKey: 'id' });
    EtatsTvaAnnexes.belongsTo(db.exercices, { foreignKey: 'id_exercice', targetKey: 'id' });
    EtatsTvaAnnexes.belongsTo(db.journals, { foreignKey: 'id_ecriture', targetKey: 'id' });
    EtatsTvaAnnexes.belongsTo(db.dossierplancomptables, { foreignKey: 'id_numcpt', targetKey: 'id' });
  };

  return EtatsTvaAnnexes;
};
