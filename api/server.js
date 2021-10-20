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
        database.getAllTickets().then(tickets => res.send(tickets)).catch(error => console.error(error));
    } else {
        database.getTicketById(req.query.id).then(ticket => res.send(ticket)).catch(error => console.error(error));
    }
});

app.get('/api/comments', checkAuth, (req, res) => {
    if (req.query.id) {
        database.getCommentById(req.query.id).then(comment => res.send(comment)).catch(error => console.error(error));
    } else if (req.query.ticketId) {
        database.getCommentsByTicketId(req.query.ticketId).then(comments => res.send(comments)).catch(error => console.error(error));
    } else {
        database.getAllComments().then(comments => res.send(comments)).catch(error => console.error(error));
    }
});

app.get('/api/users', checkAuth, (req, res) => {
    if (!req.query.id) {
        database.getAllUsers().then(users => res.send(users)).catch(error => console.error(error));
    } else {
        database.getUserById(req.query.id).then(user => res.send(user)).catch(error => console.error(error));
    }
});

app.listen(process.env.SERVER_PORT || 3000, () => {
    console.log('Express is running!');
    database.initializeDatabase().then(async () => {
        console.log('Database successfully initialized!');

        // Testowe konta i zgłoszenia
        await database.createUser('aleksander.nowak@email.com', 'password', 'Aleksander Nowak', 1, Date.now(), Date.now(), '127.0.0.1').then(user => {
            user.type = database.ACCOUNT_TYPE.TECHNICIAN;
            database.updateUser(user).catch(error => console.error(error));
        }).catch(error => console.error(error));

        await database.createUser('jan.kowalski@email.com', 'hasło123', 'Jan Kowalski', 1, Date.now(), Date.now(), '127.0.0.1').then(async user => {
            await database.createTicket(user, 'Zgłoszenie 1', 'Opis zgłoszenia').catch(error => console.error(error));
            await database.createTicket(user, 'Zgłoszenie 2', 'Opis zgłoszenia').then(ticket => {
                ticket.status = database.TICKET_STATUS.IN_PROGRESS;
                database.updateTicket(ticket).catch(error => console.error(error));
            }).catch(error => console.error(error));
            await database.createTicket(user, 'Zgłoszenie 3', 'Opis zgłoszenia').then(async ticket => {
                ticket.status = database.TICKET_STATUS.COMPLETED;
                await database.updateTicket(ticket).catch(error => console.error(error));
                await database.postComment(ticket, user, 'Komentarz');
                await database.postComment(ticket, user, 'Kolejny komentarz');
            }).catch(error => console.error(error));
        }).catch(error => console.error(error));
    }).catch(error => console.log('Database failed to initialize!'));
});