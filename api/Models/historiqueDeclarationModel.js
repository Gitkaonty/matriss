module.exports = (sequelize, DataTypes) => {
  const HistoriqueDeclaration = sequelize.define('HistoriqueDeclaration', {
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
      allowNull: false
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
    tableName: 'historique_declarations',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  // Associations
  HistoriqueDeclaration.associate = function (models) {
    HistoriqueDeclaration.belongsTo(models.dossiers, { foreignKey: 'idDossier', as: 'dossier' });
    HistoriqueDeclaration.belongsTo(models.userscomptes, { foreignKey: 'idCompte', as: 'compte' });
  };
  return HistoriqueDeclaration;
};
