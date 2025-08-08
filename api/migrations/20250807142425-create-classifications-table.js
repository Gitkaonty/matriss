module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('classifications', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      classe: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      remarque: {
        type: Sequelize.STRING,
        allowNull: false
      },
      id_compte: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'userscomptes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_dossier: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dossiers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('classifications');
  }
}; 