// api/Models/personnelModel.js
module.exports = (sequelize, DataTypes) => {
  const Personnel = sequelize.define('Personnel', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    numero_cnaps: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cin_ou_carte_resident: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id_fonction: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'fonctions',
        key: 'id'
      }
    },
    id_classe: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'classifications',
        key: 'id'
      }
    },
    nombre_enfants_charge: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date_entree: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    date_sortie: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    id_dossier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dossiers',
        key: 'id'
      }
    },
    id_compte: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'userscomptes',
        key: 'id'
      }
    }
  }, {
    tableName: 'personnels',
    timestamps: true
  });

  Personnel.associate = (models) => {
    Personnel.belongsTo(models.Fonction, { foreignKey: 'id_fonction', as: 'fonction' });
    Personnel.belongsTo(models.Classification, { foreignKey: 'id_classe', as: 'classification' });
  };

  return Personnel;
};