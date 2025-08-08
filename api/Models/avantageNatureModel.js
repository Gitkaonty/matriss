'use strict';
module.exports = (sequelize, DataTypes) => {
  const AvantageNature = sequelize.define('avantage_nature', {
    imposables: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    exoneres: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'avantage_natures',
    timestamps: true
  });
  AvantageNature.associate = function(models) {
    AvantageNature.hasMany(models.irsa, { foreignKey: 'avantageNatureId' });
  };
  return AvantageNature;
}; 