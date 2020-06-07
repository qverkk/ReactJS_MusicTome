const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);
const Router = require('./Router');

app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());

console.log('Testing server');

//Database

const db = mysql.createConnection({
    host: 'localhost',
    user: 'rustoran_info',
    password: 'pastylka11',
    database: 'rustoran_musictome'
});

db.connect(function(err) {
    if (err) {
        console.log('DB Error');
        throw err;
    } else {
        console.log('DB works');
    }
});

const sessionStore = new MySQLStore({
    expiration: (1825 * 86500 * 1000),
    endConnectionOnClose: false
}, db);

app.use(session({
    key: 'dasdnasldknasndlaksndlasdklansdkln',
    secret: '5y4n98ugnh459oguin934t345t',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: (1825 * 86500 * 1000),
        httpOnly: false
    }
}));

new Router(app, db);

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3000);