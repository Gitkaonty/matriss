module.exports = (sequelize, DataTypes) => {
    const Devise = sequelize.define('Devise', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      libelle: {
        type: DataTypes.STRING,
        allowNull: false
      },
      id_compte: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'userscomptes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_dossier: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'dossiers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    }, {
      tableName: 'devises',
      timestamps: true
    });
    return Devise;
  }; 