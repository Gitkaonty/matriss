module.exports = (sequelize, DataTypes) => {
  const historiqueDeclaration = sequelize.define('historiqueDeclaration', {
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
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    idDossier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dossiers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
  historiqueDeclaration.associate = function (models) {
    historiqueDeclaration.belongsTo(models.dossiers, { foreignKey: 'idDossier', as: 'dossier' });
    historiqueDeclaration.belongsTo(models.userscomptes, { foreignKey: 'idCompte', as: 'compte' });
  };
  return historiqueDeclaration;
};
