const database = require('../database');
const { checkAuth, sendMail } = require('../utils');

module.exports = function (app) {
    app.post('/api/tickets/comment', checkAuth, async (req, res, next) => {
        if (req.user && req.body.content && req.body.ticketId) {
            database.getTicketById(req.body.ticketId).then(async ticket => {
                if (ticket.status == 2) return;
                if (ticket.userId == req.user.id || ticket.technicianId == req.user.id) {
                    await database.postComment(ticket, req.user, req.body.content);
                    if (req.user.id == ticket.technicianId) {
                        const client = await database.getUserById(ticket.userId);
                        sendMail(client.email, `Serwisant odpowiedział na Twoje zgłoszenie #${ticket.id}`, client.username, `Serwisant odpisał na Twoje zgłoszenie:<br><br><b>${req.body.content}</b>.<br><br>Ta wiadomość została wysłana automatycznie. Aby odpowiedzieć na wiadomość serwisanta, zaloguj się do systemu zgłoszeń klikając <a href='${process.env.base}'>tutaj</a>.`);
                    } else if (req.user.id == ticket.userId) {
                        const technician = await database.getUserById(ticket.technicianId);
                        sendMail(technician.email, `Klient odpowiedział na zgłoszenie #${ticket.id}`, technician.username, `Klient odpisał na zgłoszenie:<br><br><b>${req.body.content}</b>.<br><br>Ta wiadomość została wysłana automatycznie. Aby odpowiedzieć na wiadomość klienta, zaloguj się do systemu zgłoszeń klikając <a href='${process.env.base}'>tutaj</a>.`);
                    }
                    return res.json({ success: true });
                }
            }).catch(error => console.error(error));
        }
    });

    app.post('/api/tickets/send', checkAuth, async (req, res, next) => {
        if (req.user && req.body.title.length <= 255 && req.body.description) {
            await database.createTicket(req.user, req.body.title, req.body.description).then(ticket => {
                return res.json({ success: true, ticket: ticket });
            }).catch(error => console.error(error));
        }
    });

    app.post('/api/tickets/update', checkAuth, async (req, res, next) => {
        if (req.user.type == 2 && req.body.ticketId && req.body.status) {
            await database.getTicketById(req.body.ticketId).then(async ticket => {
                if (ticket.technicianId == req.user.id) {
                    ticket.status = req.body.status;
                    await database.updateTicket(ticket).catch(error => console.error(error));
                    return res.json({ success: true });
                }
            }).catch(error => console.error(error));
        }
    });
}