module.exports = (sequelize, DataTypes) => {
  const AnomalieFormulaireTva = sequelize.define('anomaliesFormulaireTva', {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    id_dossier: { type: DataTypes.BIGINT, allowNull: false },
    id_compte: { type: DataTypes.BIGINT, allowNull: false },
    id_exercice: { type: DataTypes.BIGINT, allowNull: false },
    mois: { type: DataTypes.SMALLINT, allowNull: true },
    annee: { type: DataTypes.SMALLINT, allowNull: true },

    code: { type: DataTypes.INTEGER, allowNull: false },
    groupe: { type: DataTypes.STRING(10), allowNull: true },
    kind: { type: DataTypes.STRING(20), allowNull: true },

    expected: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
    actual: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },
    diff: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 0 },

    message: { type: DataTypes.TEXT, allowNull: true },
    commentaire: { type: DataTypes.TEXT, allowNull: true },
    valide: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, {
    tableName: 'anomalies_formulaire_tva',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return AnomalieFormulaireTva;
};
