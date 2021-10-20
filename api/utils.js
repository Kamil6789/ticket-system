const nodemailer = require('nodemailer');

const checkAuth = (req, res, next) => {
    if(req.isAuthenticated()) return next();
    res.status(401).json({
        success: false,
        error: 'NOT_AUTHORIZED'
    });
}

const sendMail = async (to, subject, username, content) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.email_host,
            port: 465,
            secure: true,
            auth: {
                user: process.env.email_address,
                pass: process.env.email_password,
            },
        });
        const info = await transporter.sendMail({
            from: `"System zgłoszeń" <${process.env.email_address}>`,
            to, 
            subject, 
            html: `<p>Witaj <b>${username}</b>,</p><br /><p>${content}</p>`
        });
        return true;
    } catch(err) {
        return false;
    }
}

module.exports = {
    checkAuth,
    sendMail
}