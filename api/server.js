const express = require('express');
const app = express();

require('dotenv').config();

const database = require('./database');

app.get('/api/tickets', (req, res) => {
    if (!req.query.id) {
        database.getAllTickets().then(tickets => res.send(tickets)).catch(error => console.error(error));
    } else {
        database.getTicketById(req.query.id).then(ticket => res.send(ticket)).catch(error => console.error(error));
    }
});

app.get('/api/users', (req, res) => {
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
        await database.createUser('aleksander.nowak@email.com', 'password', 'Aleksander Nowak').then(user => {
            user.type = database.ACCOUNT_TYPE.TECHNICIAN;
            database.updateUser(user).catch(error => console.error(error));
        }).catch(error => console.error(error));

        await database.createUser('jan.kowalski@email.com', 'hasło123', 'Jan Kowalski').then(async user => {
            await database.createTicket(user.id, 'Zgłoszenie 1', 'Opis zgłoszenia').catch(error => console.error(error));
            await database.createTicket(user.id, 'Zgłoszenie 2', 'Opis zgłoszenia').then(ticket => {
                ticket.status = database.TICKET_STATUS.IN_PROGRESS;
                database.updateTicket(ticket).catch(error => console.error(error));
            }).catch(error => console.error(error));
            await database.createTicket(user.id, 'Zgłoszenie 3', 'Opis zgłoszenia').then(ticket => {
                ticket.status = database.TICKET_STATUS.COMPLETED;
                database.updateTicket(ticket).catch(error => console.error(error));
            }).catch(error => console.error(error));
        }).catch(error => console.error(error));
    }).catch(error => console.log('Database failed to initialize!'));
});