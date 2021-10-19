const getTicketStatus = (status) => {
    switch (status) {
        case 0: return 'nowe';
        case 1: return 'w trakcie przeglądu';
        case 2: return 'rozpatrzone';
        default: return '';
    }
}

const checkAuth = (req, res, next) => {
    if(req.isAuthenticated()) return next();
    res.status(401).json({
        success: false,
        error: 'NOT_AUTHORIZED'
    });
}

module.exports = {
    getTicketStatus,
    checkAuth
}