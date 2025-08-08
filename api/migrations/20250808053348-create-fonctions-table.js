module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fonctions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      nom: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      id_dossier: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dossiers',
          key: 'id'
        }
      },
      id_compte: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'userscomptes',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('fonctions');
  }
}; 