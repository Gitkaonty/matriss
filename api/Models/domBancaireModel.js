module.exports = (sequelize, DataTypes) => {
    const dombancaires = sequelize.define( "dombancaires", {
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        id_dossier: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        banque: {
            type: DataTypes.STRING(50),
            unique: false,
            allowNull: true
        },
        numcompte: {
            type: DataTypes.STRING(50),
            unique: false,
            allowNull: true
        },
        devise: {
            type: DataTypes.STRING(15),
            unique: false,
            allowNull: true
        },
        pays: {
            type: DataTypes.STRING(75),
            unique: false,
            allowNull: true
        },
        enactivite: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue:false
        },
    }, {timestamps: true}, )

    dombancaires.associate = (models) => {
        dombancaires.belongsTo(models.pays, {
            foreignKey: 'pays',
            as: 'tablepays'
        });
    };

    return dombancaires
 }