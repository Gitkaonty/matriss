'use strict';

// permission_id 1 = can_add
// permission_id 2 = can_modify
// permission_id 3 = can_delete
// permission_id 4 = can_view

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('rolepermissions', [
      // SuperAdmin 
      { role_id: 1, permission_id: 1, allowed: true, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 1, permission_id: 2, allowed: true, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 1, permission_id: 3, allowed: true, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 1, permission_id: 4, allowed: true, createdAt: new Date(), updatedAt: new Date() },

      // Admin
      { role_id: 2, permission_id: 1, allowed: true, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 2, permission_id: 2, allowed: true, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 2, permission_id: 3, allowed: false, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 2, permission_id: 4, allowed: true, createdAt: new Date(), updatedAt: new Date() },

      // User 
      { role_id: 3, permission_id: 1, allowed: true, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 3, permission_id: 2, allowed: false, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 3, permission_id: 3, allowed: false, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 3, permission_id: 4, allowed: true, createdAt: new Date(), updatedAt: new Date() },

      // Lector 
      { role_id: 4, permission_id: 1, allowed: false, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 4, permission_id: 2, allowed: false, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 4, permission_id: 3, allowed: false, createdAt: new Date(), updatedAt: new Date() },
      { role_id: 4, permission_id: 4, allowed: true, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rolepermissions', null, {});
  }
};
