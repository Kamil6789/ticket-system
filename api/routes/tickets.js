const database = require('../database');
const { checkAuth } = require('../utils');

module.exports = function (app) {
    app.post('/api/tickets/comment', checkAuth, async (req, res, next) => {
        if (req.user && req.body.content && req.body.ticketId) {
            database.getTicketById(req.body.ticketId).then(async ticket => {
                if (ticket.userId == req.user.id || ticket.technicianId == req.user.id) {
                    await database.postComment(ticket, req.user, req.body.content);
                    return res.json({ success: true });
                }
            }).catch(error => console.error(error));
        }
    });

    app.post('/api/tickets/send', checkAuth, async (req, res, next) => {
        if (req.user && req.body.title.length <= 255 && req.body.description) {
            await database.createTicket(req.user, req.body.title, req.body.description).catch(error => console.error(error));
            return res.json({ success: true });
        }
    });
}