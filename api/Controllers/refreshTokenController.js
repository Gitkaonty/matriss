const db = require("../Models");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = db.users;
const Userscomptes =db.userscomptes;

User.belongsTo(Userscomptes, { foreignKey: 'compte_id' });
Userscomptes.hasMany(User, { foreignKey: 'compte_id' });

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt ) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({where: {
        refresh_token: refreshToken},
        include: [{ model: Userscomptes, attributes: ['nom']}]
    });
    if(!foundUser) return res.sendStatus(403); //Forbidden
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.username !== decoded.username) return res.sendStatus(403);
            const roles = Object.values(foundUser.roles).filter(Boolean);

            const accessToken = jwt.sign(
                {
                    'UserInfo':
                        {
                        'username': decoded.username,
                        'roles': roles,
                        'compteId': foundUser.compte_id,
                        'compte': foundUser.nom,
                        'userId' : foundUser.id,
                        }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn : '1d'}
            );
            //res.json({roles, accessToken});   
            res.json({ accessToken });   
        }
    )
}

module.exports = { handleRefreshToken };