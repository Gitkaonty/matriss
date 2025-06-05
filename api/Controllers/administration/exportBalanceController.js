const bcrypt = require("bcrypt");
const db = require("../../Models");
require('dotenv').config();
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const dossierplancomptable = db.dossierplancomptable;
const balances = db.balances;

balances.belongsTo(dossierplancomptable, { as: 'compteLibelle', foreignKey: 'id_numcompte' , targetKey: 'id'});
balances.belongsTo(dossierplancomptable, { as: 'compteCentralisation', foreignKey: 'id_numcomptecentr' , targetKey: 'id'});

const recupBalance = async (req, res) => {
    try{
        const { centraliser, unSolded, movmentedCpt, compteId, fileId, exerciceId } = req.body; 

        let resData = {
            state: false,
            msg: '',
            list: []
        }

        const listeBalance = await balances.findAll({
            where: 
              {
                id_compte: compteId,
                id_dossier: fileId,
                id_exercice: exerciceId,
                valeur: { [Op.gt]: unSolded? 0: -1},
                [Op.or]: [
                    { mvtdebit: { [Op.gt]: movmentedCpt? 0: -1 } },
                    { mvtcredit: { [Op.gt]: movmentedCpt? 0: -1 } }
                ]
              },
            include: [
              { model: dossierplancomptable, 
                as: 'compteLibelle',
                attributes: [
                    ['compte', 'compte'],
                    ['libelle', 'libelle'],
                    ['nature', 'nature']
                ],
                required: true,
                where: {
                    id_compte: compteId,
                    id_dossier: fileId,
                    nature: { [Op.ne]: centraliser? 'Aux': 'Collectif' }
                }
              },
            ],
            raw:true,
            order: [[{ model: dossierplancomptable, as: 'compteLibelle' }, 'libelle', 'ASC']]
        });

        if(listeBalance){
            resData.state = true;

            let sortedList = listeBalance.sort((a, b) => {
                const libA = a['compteLibelle.compte'] || '';
                const libB = b['compteLibelle.compte'] || '';
                return libA.localeCompare(libB);
            });

            resData.list = sortedList;
        }else{
            resData.state = false;
            resData.list = [];
        }
    
        return res.json(resData);
    }catch (error){
        console.log(error);
    }
}

module.exports = {
        recupBalance
    }