'use strict';
module.exports = (sequelize, DataTypes) => {
  const Irsa = sequelize.define('irsa', {
    personnelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    indemniteImposable: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    indemniteNonImposable: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    avantageImposable: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    avantageExonere: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    salaireBase: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    heuresSupp: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    primeGratification: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    autres: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    salaireBrut: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    cnapsRetenu: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    ostie: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    salaireNet: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    autreDeduction: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    montantImposable: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    impotCorrespondant: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    reductionChargeFamille: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    impotDu: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    mois: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    annee: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nom: { type: DataTypes.STRING, allowNull: true },
    prenom: { type: DataTypes.STRING, allowNull: true },
    cnaps: { type: DataTypes.STRING, allowNull: true },
    cin: { type: DataTypes.STRING, allowNull: true },
    fonction: { type: DataTypes.STRING, allowNull: true },
    dateEntree: { type: DataTypes.DATEONLY, allowNull: true },
    dateSortie: { type: DataTypes.DATEONLY, allowNull: true },

    id_dossier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dossiers',
        key: 'id'
      }
    },
    id_exercice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exercices',
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
    tableName: 'irsas',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['personnelId', 'mois', 'annee']
      }
    ]
  });
  Irsa.associate = function (models) {
    Irsa.belongsTo(models.personnels, { as: 'personnel', foreignKey: 'personnelId' });
    Irsa.belongsTo(models.indemnite, { as: 'indemnite', foreignKey: 'indemniteId' });
    Irsa.belongsTo(models.avantage_nature, { as: 'avantage_nature', foreignKey: 'avantageNatureId' });
  };
  return Irsa;
}; 