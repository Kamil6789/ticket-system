const checkAuth = (req, res, next) => {
    if(req.isAuthenticated()) return next();
    res.status(401).json({
        success: false,
        error: 'NOT_AUTHORIZED'
    });
}

module.exports = {
    checkAuth
}