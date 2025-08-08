module.exports = (sequelize, DataTypes) => {
  const Classification = sequelize.define('Classification', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    classe: {
      type: DataTypes.STRING,
      allowNull: false
    },
    remarque: {
      type: DataTypes.STRING,
      allowNull: true
    },
    id_compte: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'userscomptes',
        key: 'id'
      }
    },
    id_dossier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dossiers',
        key: 'id'
      }
    }
  }, {
    tableName: 'classifications',
    timestamps: true
  });
  return Classification;
}; 