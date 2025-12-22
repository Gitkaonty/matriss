module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('personnels', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      matricule: {
        type: Sequelize.STRING,
        allowNull: true
      },
      numero_cnaps: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cin_ou_carte_resident: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nom: {
        type: Sequelize.STRING,
        allowNull: false
      },
      prenom: {
        type: Sequelize.STRING,
        allowNull: false
      },
      id_fonction: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'fonctions',
          key: 'id'
        }
      },
      id_classe: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classifications',
          key: 'id'
        }
      },
      nombre_enfants_charge: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      date_entree: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      date_sortie: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      actif: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('personnels');
  }
}; 