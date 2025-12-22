module.exports = (sequelize, DataTypes) => {
  const rapprochements = sequelize.define("rapprochements", {
    id_compte: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'userscomptes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    id_dossier: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'dossiers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    id_exercice: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'exercices',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    pc_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    solde_comptable: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    solde_bancaire: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
    solde_non_rapproche: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0,
    },
  }, { timestamps: true });
  return rapprochements;
};
