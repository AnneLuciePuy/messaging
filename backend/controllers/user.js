const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtKey = process.env.JWT_Key || 'secret_this_should_be_longer';

const User = require('../models/user');

exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
            .then(result => {
                res.status(201).json({
                    message: 'User created!',
                    result: result
                });
            })
            .catch(error => {
                res.status(500).json({
                    message: "Vos identifiants d'authentification sont invalides!"
                });
            });
        });
};

exports.loginUser = (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: 'Auth failed !'
                });
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            console.log('user', fetchedUser) 
            if (!result) {
                return res.status(401).json({
                    message: 'Auth failed !'
                })
            }
            const token = jwt.sign(
                { email: fetchedUser.email, userId: fetchedUser._id }, 
                jwtKey, 
                { expiresIn: '1h' }
            );
            res.status(200).json({ 
                message: 'Auth success !',
                token: token,
                expiresIn: 3600,
                userId: fetchedUser._id
            });
        }).catch(error => {
            return res.status(401).json({
                message: `Vos identifiants d'authentification sont invalides : ${error}`
            });
        });
};