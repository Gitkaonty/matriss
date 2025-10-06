module.exports = (sequelize, DataTypes) => {
  const FormulaireTvaAnnexesMatrices = sequelize.define(
    'formulaire_tva_annexes_matrices',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      // Code de ligne (ex: 210, 275, ...)
      id_code: { type: DataTypes.BIGINT, allowNull: false },
      libelle: { type: DataTypes.STRING(250), allowNull: false },
      // Groupe (pour DGE uniquement). Null pour CFISC
      groupe: { type: DataTypes.STRING(4), allowNull: true },
      createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    { tableName: 'formulaire_tva_annexes_matrices', timestamps: true }
  );

  return FormulaireTvaAnnexesMatrices;
};
