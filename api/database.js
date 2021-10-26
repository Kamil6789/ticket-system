const sqlite3 = require('sqlite3');
const database = new sqlite3.Database('./api/database.db');
const crypto = require('crypto');

const ERROR = {
    USER_ALREADY_EXISTS: 'User already exists!',
    USER_DOES_NOT_EXIST: 'User does not exist!',
    TICKET_DOES_NOT_EXIST: 'Ticket does not exist!',
    COMMENT_DOES_NOT_EXIST: 'Comment does not exist!'
};

async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        database.serialize(() => {
            database.run(`
            CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER NOT NULL PRIMARY KEY,
                userId INTEGER NOT NULL,
                technicianId INTEGER NOT NULL,
                status INTEGER DEFAULT 0,
                title VARCHAR(255) DEFAULT '',
                description TEXT DEFAULT ''
            );`);
            database.run(`
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER NOT NULL PRIMARY KEY,
                ticketId INTEGER NOT NULL,
                authorId INTEGER NOT NULL,
                content TEXT DEFAULT '',
                date TIMESTAMP NOT NULL
            );`);
            database.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER NOT NULL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL,
                type INTEGER DEFAULT ${ACCOUNT_TYPE.USER},
                created TIMESTAMP NOT NULL,
                lastLogin TIMESTAMP NOT NULL,
                address VARCHAR(60) NOT NULL
            );`, (error) => {
                if (error) reject(error);
                resolve();
            });
        });
    });
}

//#region Użytkownicy
class User {
    id;
    email;
    password;
    username;
    type;
    created;
    lastLogin;
    address;

    constructor(id, email, password, username, type = ACCOUNT_TYPE.USER, created, lastLogin, address) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.username = username;
        this.type = type;
        this.created = created,
        this.lastLogin = lastLogin,
        this.address = address
    }
}

const ACCOUNT_TYPE = {
    USER: 1,
    TECHNICIAN: 2
}

async function generateNextUserId() {
    return new Promise((resolve, reject) => {
        database.get(`SELECT MAX(id) FROM users`, (error, row) => {
            if (error) reject(error);
            if (!row['MAX(id)']) resolve(1);
            resolve(row['MAX(id)'] + 1);
        });
    });
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function getNextTechnician() {
    return new Promise((resolve, reject) => {
        getAllUsers().then(users => {
            let technicians = [];

            users.forEach(user => {
                if (user.type == ACCOUNT_TYPE.TECHNICIAN) technicians.push(user);
            });

            getAllTickets().then(tickets => {
                let ticketsCount = new Map();

                technicians.forEach(technician => {
                    ticketsCount.set(technician.id, 0);
                });

                if (tickets) {
                    tickets.forEach(ticket => {
                        ticketsCount.set(ticket.technicianId, ticketsCount.get(ticket.technicianId) + 1);
                    });
                }

                let sortedTicketsCount = new Map([...ticketsCount.entries()].sort((a, b) => a[1] - b[1]));
                let nextTechnicianId = sortedTicketsCount.entries().next().value[0];
                resolve(technicians.find(technician => technician.id == nextTechnicianId));
            }).catch(error => reject(error));
        }).catch(error => reject(error));
    });
}

async function createUser(email, password, username, type, created, lastLogin, address) {
    return new Promise((resolve, reject) => {
        getUserByEmail(email).then(user => {
            reject(new Error(ERROR.USER_ALREADY_EXISTS));
        }).catch(error => {
            if (error.message == ERROR.USER_DOES_NOT_EXIST) {
                generateNextUserId().then(id => {
                    database.run(`
                    INSERT INTO users (
                        id, email, password, username, type, created, lastLogin, address
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?
                    );`, [id, email, hashPassword(password), username, type, created, lastLogin, address], (error) => {
                        if (error) reject(error);
                        resolve(new User(id, email, hashPassword(password), username, type, created, lastLogin, address));
                    });
                }).catch(error => reject(error));
            } else {
                reject(error);
            }
        });
    });
}

async function updateUser(user) {
    return new Promise((resolve, reject) => {
        database.run(`
        UPDATE users SET
            email = ?, password = ?, username = ?, type = ?, lastLogin = ?, address = ?
        WHERE id = ?;
        `, [user.email, user.password, user.username, user.type, user.lastLogin, user.address, user.id], (error) => {
            if (error) reject(error);
            resolve(user);
        });
    });
}

async function getAllUsers() {
    return new Promise((resolve, reject) => {
        let users = [];
        let count = 0;
        let index = 0;

        database.get(`SELECT COUNT(id) FROM users`, (error, row) => {
            if (error) reject(error);
            if (!row['COUNT(id)']) resolve(null);
            count = row['COUNT(id)'];
            if (count == 0) resolve(users);

            database.each(`SELECT * FROM users`, (error, row) => {
                if (error) reject(error);
                users.push(new User(row.id, row.email, row.password, row.username, row.type));
                index += 1;
                if (index == count) resolve(users);
            });
        });
    });
}

async function getUserById(id) {
    return new Promise((resolve, reject) => {
        database.get(`SELECT * FROM users WHERE id = ?`, [id], (error, row) => {
            if (error) reject(error);
            if (!row) {
                reject(new Error(ERROR.USER_DOES_NOT_EXIST));
            } else {
                resolve(row);
            }
        });
    });
}

async function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        database.get(`SELECT * FROM users WHERE email = ?`, [email], (error, row) => {
            if (error) reject(error);
            if (!row) {
                reject(new Error(ERROR.USER_DOES_NOT_EXIST));
            } else {
                resolve(row);
            }
        });
    });
}
//#endregion

//#region Zgłoszenia
class Ticket {
    id;
    userId;
    technicianId;
    status;
    title;
    description;

    constructor(id, userId, technicianId, status, title, description) {
        this.id = id;
        this.userId = userId;
        this.technicianId = technicianId;
        this.status = status;
        this.title = title;
        this.description = description;
    }
}

const TICKET_STATUS = {
    NEW: 0,
    IN_PROGRESS: 1,
    COMPLETED: 2
};

async function generateNextTicketId() {
    return new Promise((resolve, reject) => {
        database.get(`SELECT MAX(id) FROM tickets`, (error, row) => {
            if (error) reject(error);
            if (!row['MAX(id)']) resolve(1);
            resolve(row['MAX(id)'] + 1);
        });
    });
}

async function createTicket(user, title, description) {
    return new Promise((resolve, reject) => {
        generateNextTicketId().then(id => {
            getNextTechnician().then(technician => {
                database.run(`
                INSERT INTO tickets (
                    id, userId, technicianId, title, description
                ) VALUES (
                    ?, ?, ?, ?, ?
                );`, [id, user.id, technician.id, title, description], (error) => {
                    if (error) reject(error);
                    resolve(new Ticket(id, user.id, technician.id, TICKET_STATUS.NEW, title, description));
                });
            }).catch(error => reject(error));
        }).catch(error => reject(error));
    });
}

async function updateTicket(ticket) {
    return new Promise((resolve, reject) => {
        database.run(`
        UPDATE tickets SET
            userId = ?, technicianId = ?, status = ?, title = ?, description = ?
        WHERE id = ?;
        `, [ticket.userId, ticket.technicianId, ticket.status, ticket.title, ticket.description, ticket.id], (error) => {
            if (error) reject(error);
            resolve(ticket);
        });
    });
}

async function getAllTickets() {
    return new Promise((resolve, reject) => {
        let tickets = [];
        let count = 0;
        let index = 0;

        database.get(`SELECT COUNT(id) FROM tickets`, (error, row) => {
            if (error) reject(error);
            if (!row['COUNT(id)']) resolve(null);
            count = row['COUNT(id)'];
            if (count == 0) resolve(tickets);

            database.each(`SELECT * FROM tickets`, (error, row) => {
                if (error) reject(error);
                tickets.push(new Ticket(row.id, row.userId, row.technicianId, row.status, row.title, row.description));
                index += 1;
                if (index == count) resolve(tickets);
            });
        });
    });
}

async function getTicketById(id) {
    return new Promise((resolve, reject) => {
        database.get(`SELECT * FROM tickets WHERE id = ?`, [id], (error, row) => {
            if (error) reject(error);
            if (!row) {
                reject(new Error(ERROR.TICKET_DOES_NOT_EXIST));
            } else {
                resolve(row);
            }
        });
    });
}
//#endregion

//#region Komentarze
class Comment {
    id;
    ticketId;
    authorId;
    content;
    date;

    constructor(id, ticketId, authorId, content, date) {
        this.id = id;
        this.ticketId = ticketId;
        this.authorId = authorId;
        this.content = content;
        this.date = date;
    }
}

async function generateNextCommentId() {
    return new Promise((resolve, reject) => {
        database.get(`SELECT MAX(id) FROM comments`, (error, row) => {
            if (error) reject(error);
            if (!row['MAX(id)']) resolve(1);
            resolve(row['MAX(id)'] + 1);
        });
    });
}

async function postComment(ticket, author, content) {
    let timestamp = Date.now();

    return new Promise((resolve, reject) => {
        generateNextCommentId().then(id => {
            database.run(`
            INSERT INTO comments (
                id, ticketId, authorId, content, date
            ) VALUES (
                ?, ?, ?, ?, ?
            );`, [id, ticket.id, author.id, content, timestamp], (error) => {
                if (error) reject(error);
                resolve(new Comment(id, ticket.id, author.id, content, timestamp));
            });
        }).catch(error => reject(error));
    });
}

async function getAllComments() {
    return new Promise((resolve, reject) => {
        let comments = [];
        let count = 0;
        let index = 0;

        database.get(`SELECT COUNT(id) FROM comments`, (error, row) => {
            if (error) reject(error);
            if (!row['COUNT(id)']) resolve(null);
            count = row['COUNT(id)'];
            if (count == 0) resolve(comments);

            database.each(`SELECT * FROM comments`, (error, row) => {
                if (error) reject(error);
                comments.push(new Comment(row.id, row.ticketId, row.authorId, row.content, row.date));
                index += 1;
                if (index == count) resolve(comments);
            });
        });
    });
}

async function getCommentById(id) {
    return new Promise((resolve, reject) => {
        database.get(`SELECT * FROM comments WHERE id = ?`, [id], (error, row) => {
            if (error) reject(error);
            if (!row) {
                reject(new Error(ERROR.COMMENT_DOES_NOT_EXIST));
            } else {
                resolve(row);
            }
        });
    });
}

async function getCommentsByTicketId(ticketId) {
    return new Promise((resolve, reject) => {
        let comments = [];
        let count = 0;
        let index = 0;

        database.get(`SELECT COUNT(id) FROM comments WHERE ticketId = ?`, [ticketId], (error, row) => {
            if (error) reject(error);
            if (!row['COUNT(id)']) resolve(null);
            count = row['COUNT(id)'];
            if (count == 0) resolve(comments);

            database.each(`SELECT * FROM comments WHERE ticketId = ?`, [ticketId], (error, row) => {
                if (error) reject(error);
                comments.push(new Comment(row.id, row.ticketId, row.authorId, row.content, row.date));
                index += 1;
                if (index == count) resolve(comments);
            });
        });
    });
}
//#endregion

module.exports = {
    initializeDatabase,
    User,
    ACCOUNT_TYPE,
    hashPassword,
    createUser,
    updateUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    Ticket,
    TICKET_STATUS,
    createTicket,
    updateTicket,
    getAllTickets,
    getTicketById,
    Comment,
    generateNextCommentId,
    postComment,
    getAllComments,
    getCommentById,
    getCommentsByTicketId
}