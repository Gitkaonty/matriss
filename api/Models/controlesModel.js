module.exports = (sequelize, DataTypes) => {
    const controles = sequelize.define( "controles", {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            autoIncrement:true,
            primaryKey:true
        },
        id_compte: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        id_dossier: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        id_exercice: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue:0
        },
        declaration: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        etat_id: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        control_id: {
            type: DataTypes.INTEGER,
            unique: false,
            defaultValue:0
        },
        nbranomalie: {
            type: DataTypes.INTEGER,
            unique: false,
            defaultValue:0
        },
        anomalie: {
            type: DataTypes.STRING(255),
            unique: false,
            allowNull: true
        },
        valide: {
            type: DataTypes.BOOLEAN,
            unique: false,
            allowNull: false,
            defaultValue:false
        },
        comments: {
            type: DataTypes.STRING(255),
            unique: false,
            allowNull: true
        },
    }, {timestamps: true}, )
    return controles
 }