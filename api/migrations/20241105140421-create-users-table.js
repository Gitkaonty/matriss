'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          unique: true,
          autoIncrement:true,
          primaryKey:true
      },
      compte_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          defaultValue:0,
          unique: false,
          references: {
              model: userscomptes,
              key: 'id'
          }
      },
      username: {
          type: Sequelize.STRING(150),
          unique: false,
          allowNull: false
      },
      email: {
          type: Sequelize.STRING(150),
          unique: true,
          isEmail: true, //checks for email format
          allowNull: false
      },
      password: {
          type: Sequelize.STRING(255),
          allowNull: false
      },
      roles: {
          type: Sequelize.JSON,
          allowNull: false
      },
      refresh_token: {
          type: Sequelize.STRING(350),
          allowNull: true
      },
    },
    {timestamps: true}
  );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
