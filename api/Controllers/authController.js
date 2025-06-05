const bcrypt = require("bcrypt");
const db = require("../Models");
const jwt = require('jsonwebtoken');
const roles_list = require('../config/roles_list');
require('dotenv').config();

const User = db.users;
const Userscomptes =db.userscomptes;

User.belongsTo(Userscomptes, { foreignKey: 'compte_id' });
Userscomptes.hasMany(User, { foreignKey: 'compte_id' });

const handleLogin = async (req, res) => {
    const {email, password} = req.body;
   
    if (!password || !email ) return res.status(400).json({'message': 'Le login et mot de passe sont obligatoires.'});

    const foundUser = await User.findOne({
        where: {email: email},
        include: [{ model: Userscomptes, attributes: ['nom']}]
    });

    if(!foundUser) return res.sendStatus(401);

    const match = await bcrypt.compare(password,foundUser.password);
    if(match){
        const roles = Object.values(foundUser.roles).filter(Boolean);
        // const compte = await UserCompte.findOne({
        //     where: {id: foundUser.compte_id}
        // });
        const accessToken = jwt.sign(
            {
                'UserInfo':
                {
                'username': foundUser.username,
                'roles': roles,
                'compteId': foundUser.compte_id,
                'compte': foundUser.nom,
                'userId' : foundUser.id,
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '10s'}
        );

        const refreshToken = jwt.sign(
            {'username': foundUser.username},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        );

        const username =foundUser.username;

        //sauvegarder le refresh token
        const currentuser={...foundUser, refreshToken}
        const saveRefreshToken = await User.update({refresh_token: refreshToken}, {where: {id: foundUser.id}});

        res.cookie('jwt', refreshToken, {httpOnly: true, sameSite: 'Lax', maxAge: 24*60*60*1000}); //secure: true, a enlever si on travail sur chrome
        //res.json({ username, roles, accessToken});
        res.json({ accessToken }); //envoyer seulement accessToken car les infos username et roles sont décryptable dedans
    }else{
        res.sendStatus(401);
    }   
}

module.exports = { handleLogin };