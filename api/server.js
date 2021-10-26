const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieSession = require('cookie-session');
const flash = require('connect-flash');
const cors = require('cors');
const history = require('connect-history-api-fallback');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('dist'));
app.use(cookieSession({secret: 'somesecrettokenhere'}));
app.use(flash());
app.use(cors());

app.use(history({
    index: '/index.html',
    rewrites: [{
        from: /^\/api\/.*$/,
        to: function(context) {
            return context.parsedUrl.path
        }
    }]
}));
  
app.use(express.static('dist'));

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
        database.getAllTickets().then(async tickets => {
            tickets = tickets.filter(ticket => ticket.userId == req.user.id || ticket.technicianId == req.user.id);
            for(const ticket of tickets) {
                const comments = await database.getCommentsByTicketId(ticket.id);
                let arr = [];
                for(const i in comments) {
                    arr.push(comments[i]);
                }
                arr.reverse();
                ticket.updated = arr[0]?.date || ticket.date;
            }
            tickets.sort((a, b) => a.updated - b.updated)
            tickets ? res.send(tickets.reverse()) : res.send(tickets);
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
                if (ticket.userId == req.user.id || ticket.technicianId == req.user.id) comments ? res.send(comments.reverse()) : res.send(comments);
                else res.status(401).send();
            }).catch(error => console.error(error));
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

app.get('/api/users', checkAuth, async (req, res) => {
    if (!req.query.id) {
        const users = await database.getAllUsers();
        const toSend = [];
        for (const user of users) {
            if (user.id == req.user.id || req.user.type == 2 || user.type == 2) {
                delete user.password;
                delete user.address;
                toSend.push(user);
            }
        }
        res.send(toSend);
    } else {
        const user = await database.getUserById(req.query.id);
        if (user.id == req.user.id || req.user.type == 2 || user.type == 2) {
            delete user.password;
            delete user.address;
            res.send(user);
        } else return res.status(401).send();
    }
});

app.get('/', (req, res) => {
    res.sendFile('dist/index.html');
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