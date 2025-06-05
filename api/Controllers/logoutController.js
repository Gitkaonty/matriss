const db = require("../Models");
require('dotenv').config();

const User = db.users;

const handleLogout = async (req, res) => {
    //On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt ) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    //is refreshToken in db?
    const foundUser = await User.findOne({where: {refresh_token: refreshToken}});
    if(!foundUser){
        res.clearCookie('jwt', {httpOnly: true, sameSite: 'Lax'});
        return res.sendStatus(204);
    }

    //delete refreshToken in db
    const deleteRefreshToken = await User.update(
        {refresh_token: null},
        {
            where:{refresh_token: refreshToken}
        }

    );
    res.clearCookie('jwt', {httpOnly: true, sameSite: 'Lax'}); //secure: true - only servers on https
    res.sendStatus(204);
}

module.exports = { handleLogout };