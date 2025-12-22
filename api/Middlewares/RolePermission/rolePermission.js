const db = require('../../Models');
const userPermission = db.userPermission;
const rolePermission = db.rolePermission;

const createUserPermission = async (user_id, role_id) => {
    const testIfUserPermissionExist = await userPermission.findAll({
        where: { user_id }
    });

    if (testIfUserPermissionExist.length > 0) return;

    const rolePermissionData = await rolePermission.findAll({
        where: { role_id }
    });

    const data = [];

    for (const rp of rolePermissionData) {
        const dataCreated = await userPermission.create({
            user_id,
            permission_id: rp.permission_id,
            allowed: rp.allowed
        });
        data.push(dataCreated);
    }

    return data;
};

module.exports = {
    createUserPermission
}