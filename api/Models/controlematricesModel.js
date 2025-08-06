module.exports = (sequelize, DataTypes) => {
    const controlematrices = sequelize.define( "controlematrices", {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            autoIncrement:true,
            primaryKey:true
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
        typecontrol: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        typecomparaison: {
            type: DataTypes.STRING(20),
            unique: false,
            allowNull: true
        },
        nbrgroup: {
            type: DataTypes.INTEGER,
            unique: false,
            defaultValue:0
        },
        comments: {
            type: DataTypes.STRING(255),
            unique: false,
            allowNull: true
        },
    }, {timestamps: true}, )
    return controlematrices
 }