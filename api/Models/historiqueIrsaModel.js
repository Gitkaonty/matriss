module.exports = (sequelize, DataTypes) => {
  const HistoriqueIrsa = sequelize.define('HistoriqueIrsa', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idCompte: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'userscomptes',
        key: 'id'
      }
    },
    idDossier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dossiers',
        key: 'id'
      }
    },
    declaration: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'IRSA'
    },
    designation: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    date_export: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'historique_irsa',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  // Associations
  HistoriqueIrsa.associate = function(models) {
    HistoriqueIrsa.belongsTo(models.dossiers, { foreignKey: 'idDossier', as: 'dossier' });
    HistoriqueIrsa.belongsTo(models.userscomptes, { foreignKey: 'idCompte', as: 'compte' });
  };
  return HistoriqueIrsa;
};
