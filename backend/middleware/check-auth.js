const jwt = require('jsonwebtoken');
const jwt = require('jsonwebtoken');

const jwtKey = process.env.JWT_Key || 'secret_this_should_be_longer';

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, jwtKey);
        req.userData = { email: decodedToken.email, userId: decodedToken.userId };
        next();
    } catch (error) {
        res.status(401).json({ message: "Vous n'êtes pas authentifié!" });
    }
}