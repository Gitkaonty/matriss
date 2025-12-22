module.exports = (sequelize, DataTypes) => {
    const userPermission = sequelize.define("userpermissions", {
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'users',
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
        tableName: "userpermissions",
        timestamps: true
    },)
    return userPermission;
}