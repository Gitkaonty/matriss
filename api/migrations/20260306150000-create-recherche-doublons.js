module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('recherche_doublons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_dossier: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_exercice: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_periode: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_jnl: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      compte: {
        type: Sequelize.STRING,
        allowNull: true
      },
      journal: {
        type: Sequelize.STRING,
        allowNull: true
      },
      piece: {
        type: Sequelize.STRING,
        allowNull: true
      },
      libelle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      debit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0
      },
      credit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0
      },
      id_doublon: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Index pour accélérer les recherches
    await queryInterface.addIndex('recherche_doublons', ['id_dossier', 'id_exercice', 'id_periode']);
    await queryInterface.addIndex('recherche_doublons', ['id_doublon']);
    await queryInterface.addIndex('recherche_doublons', ['date', 'compte', 'journal', 'piece', 'libelle']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('recherche_doublons');
  }
};
