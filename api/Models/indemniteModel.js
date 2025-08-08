'use strict';
module.exports = (sequelize, DataTypes) => {
  const Indemnite = sequelize.define('indemnite', {
    imposables: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    nonImposables: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'indemnites',
    timestamps: true
  });
  Indemnite.associate = function(models) {
    Indemnite.hasMany(models.irsa, { foreignKey: 'indemniteId' });
  };
  return Indemnite;
}; 