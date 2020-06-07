// const bcrypt = require('bcrypt');

class Router {
    
    constructor(app, db) {
        this.login(app,db);
        this.logout(app, db);
        this.isLoggedIn(app, db);
        this.register(app,db);
    }

    register(app,db) {
        app.post('/register', (req, res) => {
            let email = req.body.email;
            let username = req.body.username;
            let password_confirmation = req.body.password_confirmation;

            username = username.toLowerCase();

            if (username.length > 12 || password_confirmation.length > 12) {
                res.json({
                    success: false,
                    msg: 'Nazwa użytkownika lub hasło przekracza dozwoloną ilość znaków (12)'
                })
                return;
            }

            let checkUsername = [username];
            db.query('SELECT * FROM user WHERE username = ? LIMIT 1', checkUsername, (err, data, fields) => {
                if(err) {
                    res.json({
                        success:false,
                        msg: 'Something went wrong with registration'
                    })
                    return;
                } else if(data && data.length === 0) {
                    let hashPswd = password_confirmation;

                    let pswd = password_confirmation;

                    let values = [
                        [null, username, pswd]
                    ];

                    db.query('INSERT INTO `user` (`id`, `username`, `password`) VALUES ?', [values], (err, data, fields) => {
                        if(err) {
                            console.log('Register error');
                            console.log(err)
                        } else {
                            res.json({
                                success: true,
                                msg: 'Użytkownik został zarejestronwany'
                            })
                            return;
                        }
                    })
                    
                } else if(data && data.length === 1) {
                    res.json({
                        success:false,
                        msg: 'Użytkownik o danej nazwie użytkownika już istnieje'
                    })
                    return;
                }
            })

        });
    }

    login(app, db) {
        
        app.post('/login', (req, res) => {
            let username = req.body.username;
            let password = req.body.password;

            username = username.toLowerCase();

            if(username.length > 12 || password.length > 12) {
                res.json({
                    success: false,
                    msg: 'Password or login too long'
                })
                return; 
            }

            let checkUser = [username];
            db.query('SELECT * FROM user WHERE username = ? LIMIT 1', checkUser, (err, data, fields) => {
                if(err) {
                    res.json({
                        success: false,
                        msg: "Error - No such user in db"
                    })
                    return;
                }

                if(data && data.length === 1) {
                    bcrypt.compare(password, data[0].password, (bcryptErr, verified) => {
                        if(verified) {
                            req.session.userID = data[0].id;

                            res.json({
                                success: true,
                                username: data[0].username
                            })

                            console.log(data[0].username)
                            return;
                        } else {
                            res.json({
                                success: false,
                                msg: 'Errorr'
                            })
                        }
                    })
                } else [
                    res.json({
                        success: false,
                        msg: 'User not found'
                    })
                ]
            });
        });
    }



    logout(app, db) {
        app.post('/logout', (req, res) => {
            if(req.session.userID) {
                req.session.destroy();
                res.json({
                    success: true
                })

                return true;
            } else {
                res.json({
                    success:false
                })
                return false;
            }
        })
    }

    isLoggedIn(app, db) {
        app.post('/isLoggedIn', (req, res) => {
            if(req.session.userID) {
                
                let cols = [req.session.userID];
                db.query('SELECT * FROM user WHERE id = ? LIMIT 1', cols, (err, data, fields) => {
                    if(data && data.length === 1) {
                        res.json({
                            success: true,
                            username: data[0].username
                        }) 
                        return true;
                    } else {
                        res.json({
                            success: false,
                            username: ''
                        }) 
                    }
                });

            }  else {
                res.json({
                    success: false
                })
            }
        });
    }
}

module.exports = Router;