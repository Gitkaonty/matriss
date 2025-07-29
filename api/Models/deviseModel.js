module.exports = (sequelize, DataTypes) => {
    const Devises = sequelize.define("devises", {
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        libelle: {
            type: DataTypes.STRING,
            allowNull: false
        },
        compte_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'userscomptes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        }
    }, {
        tableName: "devises",
        timestamps: true
    });
    return Devises;
};
