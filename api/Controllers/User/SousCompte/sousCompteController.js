require('dotenv').config();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const db = require("../../../Models");
const { Op } = require('sequelize');

const Sequelize = require('sequelize');
const fs = require('fs');

const users = db.users; 
const userscomptes = db.userscomptes;
const resettokens = db.resettokens;

const transporter = require('../../../config/mailer');

exports.getAllSousComptes = async (req, res) => {
    try {
        const sousComptes = await users.findAll({
            order: [["compte_id", "ASC"]]
        })
        if (!sousComptes) {
            return res.status(409).json({ message: 'Sous-comptes non trouvés', state: false })
        }
        return res.status(200).json({ message: "Sous-comptes reçues aves succès", state: true, list: sousComptes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.getAllSousComptesByIdCompte = async (req, res) => {
    try {
        const { compteIds } = req.body;
        if (!Array.isArray(compteIds)) {
            return res.status(409).json({ message: 'Ids des comptes non trouvé', state: false })
        }
        const sousComptes = await users.findAll({
            where: {
                compte_id: compteIds
            },
            order: [["compte_id", "ASC"], ["id", "ASC"]]
        })
        if (!sousComptes) {
            return res.status(409).json({ message: 'Sous-comptes non trouvés', state: false })
        }
        return res.status(200).json({ message: "Sous-comptes filtrés avec les comptes reçues aves succès", state: true, list: sousComptes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.addSousCompte = async (req, res) => {
    try {
        const { username, email, password, compte_id, roles } = req.body;

        const hashedPwd = await bcrypt.hash(password, 10);

        await users.create({
            username,
            email,
            password: hashedPwd,
            compte_id,
            roles
        });

        const compteParent = await userscomptes.findByPk(compte_id);

        if (compteParent && compteParent.email) {
            transporter.sendMail({
                from: `"Kaonti" <${process.env.MAIL_USER}>`,
                to: compteParent.email,
                subject: "Nouveau sous-compte créé",
                text: `Bonjour, un nouveau sous-compte a été créé : Nom: ${username}, Email: ${email}`,
                html: `<div style="font-family:Arial,sans-serif;">
                <h2 style="color:#1976d2;">Nouveau sous-compte créé</h2>
                <p>Bonjour,</p>
                <p>Un nouveau sous-compte a été créé :</p>
                <ul>
                  <li><strong>Nom:</strong> ${username}</li>
                  <li><strong>Email:</strong> ${email}</li>
                </ul>
                <p>Cordialement,<br>L'équipe Kaonti</p>
               </div>`
            })
                .then(info => console.log("Email envoyé pour ajout de sous-compte :", info.messageId))
                .catch(err => console.error("Erreur envoi mail :", err));
        }

        return res.status(200).json({
            message: "Sous-compte ajouté avec succès",
            state: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erreur serveur",
            state: false,
            error: error.message
        });
    }
};

exports.deleteSelectedSousCompte = async (req, res) => {
    try {
        const { sousCompteIds } = req.body;

        if (!Array.isArray(sousCompteIds)) {
            return res.status(404).json({ message: 'Ids des sous-comptes non trouvés', state: false });
        }

        // Récupérer les sous-comptes avant suppression
        const sousComptes = await users.findAll({
            where: { id: sousCompteIds }
        });

        // Supprimer les sous-comptes
        const result = await users.destroy({
            where: { id: sousCompteIds }
        });

        // Regrouper les sous-comptes par compte parent
        const comptesMap = {};
        sousComptes.forEach(sc => {
            if (!comptesMap[sc.compte_id]) comptesMap[sc.compte_id] = [];
            comptesMap[sc.compte_id].push(sc);
        });

        // Envoyer un seul email par compte parent avec tableau HTML
        for (const compteId in comptesMap) {
            const compteParent = await userscomptes.findByPk(compteId);
            if (compteParent && compteParent.email) {
                const rows = comptesMap[compteId].map(sc => `
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 6px">${sc.username}</td>
                        <td style="border: 1px solid #ccc; padding: 6px">${sc.email}</td>
                    </tr>
                `).join('');

                const htmlTable = `
                    <div style="font-family:Arial,sans-serif;">
                      <h2 style="color:#d32f2f;">Sous-comptes supprimés</h2>
                      <p>Bonjour,</p>
                      <p>Les sous-comptes suivants ont été supprimés :</p>
                      <table style="border-collapse: collapse; width: 100%;">
                        <thead>
                          <tr>
                            <th style="border: 1px solid #ccc; padding: 6px; background:#1A5276; text-align: left; color : #fff">Nom du sous-compte</th>
                            <th style="border: 1px solid #ccc; padding: 6px; background:#1A5276; text-align: left; color : #fff">Email du sous-compte</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${rows}
                        </tbody>
                      </table>
                      <p>Cordialement,<br>L'équipe Kaonti</p>
                    </div>
                `;

                transporter.sendMail({
                    from: `"Kaonti" <${process.env.MAIL_USER}>`,
                    to: compteParent.email,
                    subject: "Suppression de sous-comptes",
                    text: `Bonjour, les sous-comptes suivants ont été supprimés : ${comptesMap[compteId].map(sc => sc.email).join(', ')}`,
                    html: htmlTable
                })
                    .then(info => console.log("Email envoyé pour suppression de sous-compte :", info.messageId))
                    .catch(err => console.error("Erreur envoi mail :", err));
            }
        }

        return res.status(200).json({
            state: true,
            message: `${result} sous-compte(s) supprimé(s) avec succès`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
};

exports.matchPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        if (!id) {
            return res.status(409).json({ message: 'Id du sous-compte non trouvés', state: false });
        }
        if (!password) {
            return res.status(409).json({ message: 'Veuillez saisir le mot de passe s\'il vous plaît', state: false });
        }
        const sousCompte = await users.findByPk(id);
        if (!sousCompte) {
            return res.status(409).json({ message: 'Sous-compte non trouvé', state: false });
        }
        const match = await bcrypt.compare(password, sousCompte.password);
        if (match) {
            return res.status(200).json({ message: 'Mot de passe correcte', state: true });
        }
        else {
            return res.status(200).json({ message: 'Mot de passe incorrecte', state: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.sendCodeToEmail = async (req, res) => {
    try {
        const { code, id_compte } = req.body;

        if (!code || !id_compte) {
            return res.status(409).json({ message: 'Champ incomplet', state: false });
        }

        const sousCompte = await users.findByPk(id_compte);

        if (!sousCompte || !sousCompte.email) {
            return res.status(404).json({ message: 'Sous-compte non trouvé ou email manquant', state: false });
        }

        await transporter.sendMail({
            from: `"Kaonti" <${process.env.MAIL_USER}>`,
            to: sousCompte.email,
            subject: "Code de validation",
            text: `Bonjour,\n\nVoici votre code de validation : ${code}\n\nMerci de ne pas le partager.`,
            html: `<div style="font-family:Arial,sans-serif;">
                    <h2 style="color:#1976d2;">Code de validation</h2>
                    <p>Bonjour,</p>
                    <p>Voici votre code de validation : <strong>${code}</strong></p>
                    <p>Merci de ne pas le partager.</p>
                  </div>`
        })
            .then(info => console.log("Email envoyé pour le code de validation :", info.messageId))
            .catch(err => console.error("Erreur envoi mail :", err));

        return res.status(200).json({
            message: 'Code envoyé avec succès',
            state: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!id) {
            return res.status(409).json({ message: 'Id non trouvé', state: false });
        }
        if (!password) {
            return res.status(409).json({ message: 'Mot de passe non fourni', state: false });
        }

        const sousCompte = await users.findByPk(id);

        if (!sousCompte) {
            return res.status(409).json({ message: 'Sous-compte non trouvé', state: false });
        }

        const hashedPwd = await bcrypt.hash(password, 10);

        await sousCompte.update({
            password: hashedPwd
        });

        res.status(200).json({
            message: 'Mot de passe modifié avec succès',
            state: true
        });

        transporter.sendMail({
            from: `"Kaonti" <${process.env.MAIL_USER}>`,
            to: sousCompte.email,
            subject: "Confirmation de modification du mot de passe",
            text: `Bonjour ${sousCompte.username || ''},\n\nVotre mot de passe a été modifié avec succès.\n\nSi vous n'êtes pas à l'origine de cette action, veuillez contacter immédiatement le support.`,
            html: `<div style="font-family:Arial,sans-serif;">
                    <h2 style="color:#1976d2;">Modification du mot de passe</h2>
                    <p>Bonjour <strong>${sousCompte.username || ''}</strong>,</p>
                    <p>Votre mot de passe a été modifié avec succès.</p>
                    <p>Si vous n'êtes pas à l'origine de cette action, <span style="color:red;">contactez immédiatement notre support</span>.</p>
                  </div>`
        })
            .then(info => console.log("Email envoyé pour la modification de mot de passe :", info.messageId))
            .catch(err => console.error("Erreur envoi mail :", err));

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.verifyEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(409).json({ message: "Veuillez saisir l'email s'il vous plaît", state: false });
        }

        const sousCompte = await users.findOne({ where: { email } });
        if (!sousCompte) {
            return res.status(409).json({ message: "Sous-compte non trouvé", state: false });
        }

        const lastToken = await resettokens.findOne({
            where: {
                user_id: sousCompte.id,
            },
            order: [['createdAt', 'DESC']],
        })

        const now = new Date();
        if (lastToken) {
            const elapsed = (now - lastToken.createdAt) / 1000;
            if (elapsed < 60) {
                return res.status(429).json({
                    message: `Veuillez patienter ${Math.ceil(60 - elapsed)}s avant de réessayer.`,
                    state: false
                });
            }
        }

        await resettokens.destroy({
            where: {
                user_id: sousCompte.id,
            }
        })

        // Génération d'un token unique
        // const token = crypto.randomBytes(32).toString("hex");
        const token = jwt.sign(
            { userId: sousCompte.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        );

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        // Création du token dans la base
        await resettokens.create({
            user_id: sousCompte.id,
            token_hash: token,
            expires_at: expiresAt,
            used: false
        });

        // Envoi de l'email de réinitialisation
        const resetUrl = `http://localhost:5173/reset-password/token=${token}`;
        await transporter.sendMail({
            from: `"Kaonti" <${process.env.MAIL_USER}>`,
            to: sousCompte.email,
            subject: "Réinitialisation de votre mot de passe",
            text: `Bonjour ${sousCompte.username || ''},\n\nCliquez sur ce lien pour réinitialiser votre mot de passe : ${resetUrl}\n\nCe lien est valable 1 heure.`,
            html: `<div style="font-family:Arial,sans-serif;">
                    <h2 style="color:#1976d2;">Réinitialisation du mot de passe</h2>
                    <p>Bonjour <strong>${sousCompte.username || ''}</strong>,</p>
                    <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                    <p><a href="${resetUrl}" style="background-color:#1976d2;color:white;padding:8px 12px;text-decoration:none;border-radius:4px;">Réinitialiser le mot de passe</a></p>
                    <p>Ce lien expire dans 1 heure.</p>
                  </div>`
        })
            .then(info => console.log("Email envoyé :", info.messageId))
            .catch(err => console.error("Erreur envoi mail :", err));

        return res.status(200).json({
            message: "Email de réinitialisation envoyé avec succès",
            state: true
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
};

exports.updateForgotPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, token } = req.body;

        if (!id) {
            return res.status(409).json({ message: 'Id non trouvé', state: false });
        }
        if (!password || !token) {
            return res.status(409).json({ message: 'Champ non fourni', state: false });
        }

        const expiredToken = await resettokens.findOne({
            where: {
                user_id: id,
                token_hash: token
            }
        })

        if (!expiredToken) {
            return res.status(409).json({ message: 'Token invalide', state: false });
        }

        if (expiredToken.used) {
            return res.status(409).json({ message: 'Le token est déjà utilisé, veuillez renvoyer un autre code', state: false });
        }

        if (expiredToken.expires_at.getTime() <= Date.now()) {
            return res.status(409).json({ message: 'Le token est expiré, veuillez renvoyer une autre code', state: false });
        }

        await expiredToken.destroy();

        const sousCompte = await users.findByPk(id);

        if (!sousCompte) {
            return res.status(409).json({ message: 'Sous-compte non trouvé', state: false });
        }

        const hashedPwd = await bcrypt.hash(password, 10);

        await sousCompte.update({
            password: hashedPwd
        });

        res.status(200).json({
            message: 'Mot de passe modifié avec succès',
            state: true
        });

        transporter.sendMail({
            from: `"Kaonti" <${process.env.MAIL_USER}>`,
            to: sousCompte.email,
            subject: "Confirmation de modification du mot de passe",
            text: `Bonjour ${sousCompte.username || ''},\n\nVotre mot de passe a été modifié avec succès.\n\nSi vous n'êtes pas à l'origine de cette action, veuillez contacter immédiatement le support.`,
            html: `<div style="font-family:Arial,sans-serif;">
                    <h2 style="color:#1976d2;">Modification du mot de passe</h2>
                    <p>Bonjour <strong>${sousCompte.username || ''}</strong>,</p>
                    <p>Votre mot de passe a été modifié avec succès.</p>
                    <p>Si vous n'êtes pas à l'origine de cette action, <span style="color:red;">contactez immédiatement notre support</span>.</p>
                  </div>`
        })
            .then(info => console.log("Email envoyé pour la modification de mot de passe :", info.messageId))
            .catch(err => console.error("Erreur envoi mail :", err));

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}

exports.verifyResetToken = async (req, res) => {
    try {
        const { token, userId } = req.body;

        if (!token || !userId) {
            return res.status(409).json({ message: 'Token ou Id incomplet', state: false });
        }

        const expiredToken = await resettokens.findOne({
            where: {
                user_id: userId,
                token_hash: token
            }
        })

        if (!expiredToken) {
            return res.status(409).json({ message: 'Token non trouvé', state: false });
        }

        if (expiredToken.used) {
            return res.status(200).json({ message: 'Le token est déjà utilisé', state: false });
        }

        if (expiredToken.expires_at.getTime() <= Date.now()) {
            return res.status(409).json({ message: 'Le token est expiré, veuillez renvoyer une autre code', state: false });
        } else {
            return res.status(200).json({ message: 'Le token n\'est pas encore est expiré, veuillez renvoyer une autre code', state: true });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur", state: false, error: error.message });
    }
}