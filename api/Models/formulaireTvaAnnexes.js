module.exports = (sequelize, DataTypes) => {
  const FormulaireTvaAnnexes = sequelize.define(
    'formulaire_tva_annexes',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      // Code de ligne (ex: 210, 275, ...)
      id_code: { type: DataTypes.BIGINT, allowNull: false },
      libelle: { type: DataTypes.STRING(250), allowNull: false },
      montant: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
      id_compte: { type: DataTypes.BIGINT, allowNull: false },
      id_dossier: { type: DataTypes.BIGINT, allowNull: false },
      id_exercice: { type: DataTypes.BIGINT, allowNull: false },
      // Période
      mois: { type: DataTypes.INTEGER, allowNull: true },
      annee: { type: DataTypes.INTEGER, allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'formulaire_tva_annexes', timestamps: true }
  );

  FormulaireTvaAnnexes.associate = (db) => {
    FormulaireTvaAnnexes.belongsTo(db.dossiers, { foreignKey: 'id_dossier', targetKey: 'id' });
    db.dossiers.hasMany(FormulaireTvaAnnexes, { foreignKey: 'id_dossier', sourceKey: 'id' });

    FormulaireTvaAnnexes.belongsTo(db.exercices, { foreignKey: 'id_exercice', targetKey: 'id' });
    db.exercices.hasMany(FormulaireTvaAnnexes, { foreignKey: 'id_exercice', sourceKey: 'id' });

    FormulaireTvaAnnexes.belongsTo(db.userscomptes, { foreignKey: 'id_compte', targetKey: 'id' });
    db.userscomptes.hasMany(FormulaireTvaAnnexes, { foreignKey: 'id_compte', sourceKey: 'id' });
  };

  return FormulaireTvaAnnexes;
};
