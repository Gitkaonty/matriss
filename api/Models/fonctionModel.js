module.exports = (sequelize, DataTypes) => {
    const Fonction = sequelize.define('Fonction', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
      },
    }, {
      tableName: 'fonctions',
      timestamps: true
    });
  
    Fonction.associate = (models) => {
      Fonction.hasMany(models.Personnel, { foreignKey: 'id_fonction' });
    };
  
    return Fonction;
  };