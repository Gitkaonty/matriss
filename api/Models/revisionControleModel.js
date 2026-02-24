const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RevisionControle = sequelize.define('RevisionControle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_compte: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_dossier: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_exercice: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_revision: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'revisions',
        key: 'id'
      }
    },
    id_controle: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Type: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    compte: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    test: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    anomalies: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Valider: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    Commentaire: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Affichage: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'ligne',
      validate: {
        isIn: [['ligne', 'ecriture']]
      }
    }
  }, {
    tableName: 'table_revisions_controles',
    timestamps: true,
  });

  RevisionControle.associate = (models) => {
    RevisionControle.belongsTo(models.revision, {
      foreignKey: 'id_revision',
      as: 'revision'
    });
  };

  return RevisionControle;
};