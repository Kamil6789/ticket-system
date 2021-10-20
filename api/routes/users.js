const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const {verify} = require('hcaptcha');

const database = require('../database');
const {checkAuth, sendMail} = require('../utils');

const recovery = {};

module.exports = function(app) {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            process.nextTick(async function() {
                try {
                    let user = await database.getUserByEmail(email);
                    if(user.password !== database.hashPassword(password)) return done(null, false, req.flash('message', 'WRONG_PASSWORD'));
                    user.lastLogin = Date.now();
                    user.address = (req.headers['x-forwarded-for'].split(','))[0];
                    database.updateUser(user);
                    return done(null, user);
                } catch(err) {
                    if(err.message == 'User does not exist!') return done(null, false, req.flash('message', 'WRONG_PASSWORD'));
                    done(null, false, req.flash('message', 'UNKNOWN_ERROR'));
                }
            });
        }
    ));

    app.post('/api/user/register', async (req, res, next) => {
        if(!req.body.username || req.body.username.length > 50 || !req.body.email || req.body.email.length > 100 || !req.body.password || req.body.password > 100 || !req.body.captcha) return res.json({success: false, error: 'INCORRECT_DATA'});
        try {
            const captcha = await verify(process.env.captcha, req.body.captcha);
            if(!captcha.success) return res.json({success: false, error: 'EMPTY_CAPTCHA'});
            const user = await database.createUser(req.body.email, req.body.password, req.body.username, 1, Date.now(), Date.now(), (req.headers['x-forwarded-for'].split(','))[0]);
            return res.json({success: true});
        } catch(err) {
            if(err.message == 'User already exists!') return res.json({success: false, error: 'USER_ALREADY_EXISTS'});
            res.json({success: false, error: 'UNKNOWN_ERROR'});
        }
    });

    app.post('/api/user/login', async (req, res, next) => {
        passport.authenticate('local', {failureRedirect: '/', failureMessage: true}, (err, user) => {
            req.logIn(user, (err) => {
                if(err) return res.json({success: false, error: req.flash('message')});
                req.session.save();
                res.json({success: true});
            });
        })(req, res, next);
    });

    app.post('/api/user/recover', async (req, res, next) => {
        if(!req.body.email || !req.body.captcha) return res.json({success: false, error: 'INCORRECT_DATA'});
        try {
            const captcha = await verify(process.env.captcha, req.body.captcha);
            if(!captcha.success) return res.json({success: false, error: 'EMPTY_CAPTCHA'});
            let user = await database.getUserByEmail(req.body.email);
            const token = crypto.randomBytes(42).toString('hex');
            recovery[token] = req.body.email;
            const mail = sendMail(req.body.email, "Odzyskiwanie konta", user.username, `Aby odzyskać swoje konto i wygenerować nowe hasło, wejdź <a href='${process.env.base}?token=${token}'>TUTAJ</a>.`)
            mail ? res.json({success: true}) : res.json({success: false, error: 'EMAIL_ERROR'})
        } catch(err) {
            if(err.message == 'User does not exist!') return res.json({success: false, error: 'USER_NOT_EXISTS'});
            res.json({success: false, error: 'UNKNOWN_ERROR'});
        } 
    });

    app.post('/api/user/newpassword', async (req, res, next) => {
        if(!req.body.password || req.body.password.length > 100 || !req.body.token) return res.json({success: false, error: 'INCORRECT_DATA'});
        try {
            if(!recovery[req.body.token]) return res.json({success: false, error: 'UNKNOWN_ERROR'});
            let user = await database.getUserByEmail(recovery[req.body.token]);
            user.password = database.hashPassword(req.body.password);
            database.updateUser(user);
            delete recovery[req.body.token];
            return res.json({success: true});
        } catch(err) {
            if(err.message == 'User does not exist!') return res.json({success: false, error: 'USER_NOT_EXISTS'});
            res.json({success: false, error: 'UNKNOWN_ERROR'});
        } 
    });

    app.get('/api/user/info', checkAuth, async (req, res, next) => {
        res.json({success: true, user: req.user});
    });

}