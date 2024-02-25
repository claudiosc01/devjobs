const mongoose = require('mongoose')
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const router = require('./routes');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors')
const passport = require('./config/passport')


require('dotenv').config({
    path: 'variables.env'
})

const app = express()

// Habilitar bodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


// Validacion de Campos - express-validator
app.use(expressValidator());



// Habilitar handlebars como view.
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'layout',
    helpers: require('./helpers/handlebars'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));

app.set('view engine', 'handlebars')


app.use(express.static('public'));

app.use(cookieParser())


// Cosas que se necesitan para firmar la session.    // Siempre que creamos sesiones en la bd, se guardan las sesiones, 
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
         mongoUrl: process.env.DATABASE,
    })
}))


// Inicializar Passport
app.use(passport.initialize())
app.use(passport.session())


// Alertas y Flash messages
app.use(flash());


// Crear nuestro midleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
})


app.use('/', router() )

// 404 pagina no existente
app.use((req,res,next) => {
    next(createError(404, 'No Encontrado'));
})

// Administracion de los errores

app.use((err, req, res) => {
    // console.log(err);
    res.locals.mensaje = err.message;

    // console.log(err.status);

    res.render('error')
})


// Dejar que heroku asigne el puerto a nuestra app.
const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(port, host, () => {
    console.log('El servidor esta funcionando.');
})
