const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2/promise');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const { connectToDatabase } = require('./db');
const MySQLStore = require('express-mysql-session')(expressSession);
// const { ensureAdmin } = require('./utils/middlewares');

const { PORT, MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE, MYSQL_PORT, MYSQL_PASSWORD, SESSION_SECRET } =
    process.env;

async function main() {
    const app = express();

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    app.use(express.static('public'));
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: false }));

    const db = await connectToDatabase();

    /*mongoose.connection.on('error', (error) => {
    console.log('error', error);
  });*/

    // TODO: ide majd kell valami a user model-nek passport-hoz
    // const userModel = mongoose.model('user');

    passport.use(
        'local',
        // TODO: username-et atnevezni valami egyetemi azonositosra
        new LocalStrategy({ usernameField: 'username', passwordField: 'password' }, async function (
            username,
            password,
            done,
        ) {
            try {
                const user = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
                if (!user) return done(null, false);

                user.comparePasswords(password, function (error, isMatch) {
                    if (error) return done(error, false);
                    if (!isMatch) return done(null, false);
                    return done(null, user);
                });
            } catch (err) {
                console.log(err);
                return done('Error during request.', null);
            }
        }),
    );

    passport.serializeUser((user, done) => {
        if (!user) return done('No user provid  ed', null);
        return done(null, user);
    });

    passport.deserializeUser((user, done) => {
        if (!user) return done('No user provided', null);
        return done(null, user);
    });

    app.use(
        expressSession({
            secret: SESSION_SECRET,
            resave: false,
            saveUninitialized: true,
            store: new MySQLStore({
                host: MYSQL_HOST,
                port: MYSQL_PORT,
                user: MYSQL_USER,
                password: MYSQL_PASSWORD,
                database: MYSQL_DATABASE,
            }),
            cookie: {
                maxAge: 1 * 60 * 60 * 1000,
            },
        }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // NOTE: igy lehet minden oldalon elerheto valtozokat csinalni
    // app.use(async function (req, res, next) {
    //   const categories = await models.category.find();
    //   const stores = await models.store.distinct('name');
    //   res.locals = {
    //     req,
    //     categories,
    //     stores,
    //   };
    //   next();
    // });
    // TODO: route-k definialasa
    // app.use('/admin', ensureAdmin, require('./routes/admin.routes'));
    // app.use('/browse', require('./routes/browse.routes'));
    // app.use('/user', require('./routes/user.routes'));

    app.get('/', async (_req, res) => {
        // const [rows] = await db.execute('SELECT * FROM users WHERE name = ?', ['Bob']);
        const krumpli = { hello: 'krumpli' };
        const context = {
            krumpli,
            paprika: {
                asd: 'hello',
            },
            hello: 'hello',
            date: new Date(),
        };
        return res.render('krumpli', context);
        // return res.render('index', { newestBooks, topBooks, booksOfTheMonth, booksOfTheWeek });
    });

    app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}`);
    });
}

main();
