const bcrypt = require("bcrypt");
const db = require("../Models");

const User = db.users;

const handleNewuser = async (req, res) => {
    const { compte_id, username, email, password, roles } = req.body;

    if (!username || !password || !email || !roles) return res.status(400).json({
        'message': 'Tous les champs sont obligatoires.'
    });

    const duplicate = User.findOne({
        where: {
            email: email
        }
    });

    if (duplicate) return res.sendStatus(409).json({
        'message': 'Ce nom d\'utilisateur existe déjà. Veuillez saisir un nouvel utilisateur'
    });

    try {
        const hashedPwd = await bcrypt.hash(password, 10);
        const newUser = { compte_id, username, email, password, roles };
        const AddNewuser = await User.create({ newUser });
        return res.sendStatus(201).json({ 'success': `L'utilisateur ${username} a été créé` });
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

module.exports = { handleNewuser };