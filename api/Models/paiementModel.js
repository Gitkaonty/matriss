module.exports = (sequelize, DataTypes) => {
    const paiement = sequelize.define("paiement", {
        compte_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0,
            unique: false,
            references: {
                model: 'userscomptes',
                key: 'id'
            }
        },
        compte: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        date_paiement: {
            type: DataTypes.DATE,
            allowNull: true
        },
        mode_paiement: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        montant_paye: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            defaultValue: 0
        },
        periode_date_debut: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        periode_date_fin: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: "paiements",
        timestamps: true
    },)
    return paiement;
}