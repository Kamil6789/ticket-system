const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieSession = require('cookie-session');
const flash = require('connect-flash');
const cors = require('cors');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieSession({secret: 'somesecrettokenhere'}));
app.use(flash());
app.use(cors());

require('dotenv').config();

require('./routes/users')(app);
require('./routes/tickets')(app);

const database = require('./database');
const {checkAuth} = require('./utils');

passport.serializeUser(function(user, done) {
    done(null, user);
});
 
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.get('/api/tickets', checkAuth, (req, res) => {
    if (!req.query.id) {
        database.getAllTickets().then(tickets => {
            tickets = tickets.filter(ticket => ticket.userId == req.user.id || ticket.technicianId == req.user.id);
            res.send(tickets.reverse());
        }).catch(error => console.error(error));
    } else {
        database.getTicketById(req.query.id).then(ticket => {
            if (ticket.userId == req.user.id || ticket.technicianId == req.user.id) res.send(ticket);
            else res.status(401).send();
        }).catch(error => console.error(error));
    }
});

app.get('/api/comments', checkAuth, (req, res) => {
    if (req.query.id) {
        database.getCommentById(req.query.id).then(comment => {
            if (comment.authorId == req.user.id) res.send(comment);
            else res.status(401).send();
        }).catch(error => console.error(error));
    } else if (req.query.ticketId) {
        database.getCommentsByTicketId(req.query.ticketId).then(comments => {
            database.getTicketById(req.query.ticketId).then(ticket => {
                if (ticket.userId == req.user.id || ticket.technicianId == req.user.id) res.send(comments.reverse());
                else res.status(401).send();
            }).catch(error => console.console.error(error));
        }).catch(error => console.error(error));
    } else {
        database.getAllTickets().then(async tickets => {
            tickets = tickets.filter(ticket => ticket.userId == req.user.id || ticket.technicianId == req.user.id);

            let comments = [];

            for (let i = 0; i < tickets.length; i++) {
                await database.getCommentsByTicketId(tickets[i].id).then(ticketComments => {
                    if (ticketComments) comments = comments.concat(ticketComments);
                }).catch(error => console.error(error));

                if (i == tickets.length - 1) res.send(comments);
            }
        }).catch(error => console.error(error));
    }
});

app.get('/api/users', checkAuth, (req, res) => {
    if (!req.query.id) {
        database.getAllUsers().then(users => res.send(users)).catch(error => console.error(error));
    } else {
        database.getUserById(req.query.id).then(user => res.send(user)).catch(error => console.error(error));
    }
});

app.listen(process.env.SERVER_PORT || 3000, async () => {
    console.log('Express is running!');

    try {
        database.initializeDatabase();

        // Testowe konta i zgłoszenia
        const technician = await database.createUser('aleksander.nowak@email.com', 'password', 'Aleksander Nowak', 1, Date.now(), Date.now(), '127.0.0.1');
        technician.type = database.ACCOUNT_TYPE.TECHNICIAN;
        database.updateUser(technician);

        const client = await database.createUser('jan.kowalski@email.com', 'hasło123', 'Jan Kowalski', 1, Date.now(), Date.now(), '127.0.0.1');
        await database.createTicket(client, 'Zgłoszenie 1', 'Opis zgłoszenia');
        const ticket = await database.createTicket(client, 'Zgłoszenie 2', 'Opis zgłoszenia');
        ticket.status = database.TICKET_STATUS.IN_PROGRESS;
        database.updateTicket(ticket);

        const nextTicket = await database.createTicket(client, 'Zgłoszenie 3', 'Opis zgłoszenia');
        nextTicket.status = database.TICKET_STATUS.COMPLETED;
        await database.updateTicket(nextTicket);
        await database.postComment(nextTicket, client, 'Komentarz');
        await database.postComment(nextTicket, client, 'Kolejny komentarz');
    
    } catch(err) {
        console.log('Test accounts and/or tickets could not be created as they most likely already exist.');
    }

});