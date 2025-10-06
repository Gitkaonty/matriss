module.exports = (sequelize, DataTypes) => {
  const EtatsDeclaration = sequelize.define('etatsdeclarations', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    id_compte: { type: DataTypes.INTEGER, allowNull: false },
    id_dossier: { type: DataTypes.INTEGER, allowNull: false },
    id_exercice: { type: DataTypes.INTEGER, allowNull: false },
    code: { type: DataTypes.STRING(15), allowNull: false },
    nom: { type: DataTypes.STRING(250), allowNull: false },
    valide: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    nbranomalie: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    mois: { type: DataTypes.INTEGER, allowNull: true },
    annee: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'etatsdeclarations',
    underscored: true,
    timestamps: true,
  });

  return EtatsDeclaration;
};
