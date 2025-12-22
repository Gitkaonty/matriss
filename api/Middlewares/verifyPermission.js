const verifyPermission = (...allowedPermissions) => {
    return (req, res, next) => {
        if (!req?.permission) return res.sendStatus(401);
        const permissionArray = [...allowedPermissions];
        const result = req.permission.map(permission => permissionArray.includes(permission)).find(val => val === true);
        if (!result) return res.sendStatus(401);
        next();
    }
}

module.exports = verifyPermission;