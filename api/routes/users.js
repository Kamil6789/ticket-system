const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const {verify} = require('hcaptcha');

const database = require('../database');
const {checkAuth} = require('../utils');

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
                    const user = await database.getUserByEmail(email);
                    if(user.password !== database.hashPassword(password)) return done(null, false, req.flash('message', 'WRONG_PASSWORD'));
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
            const user = await database.createUser(req.body.email, req.body.password, req.body.username);
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

    app.get('/api/user/info', checkAuth, async (req, res, next) => {
        res.json({success: true, user: req.user});
    });

}