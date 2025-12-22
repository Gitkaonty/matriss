module.exports = (sequelize, DataTypes) => {
    const rolePermission = sequelize.define("rolepermissions", {
        role_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        permission_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'permissions',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        allowed: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: "rolepermissions",
        timestamps: true
    },)
    return rolePermission;
}