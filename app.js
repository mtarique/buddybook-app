const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const app = express(); 

let sessionOptions = session({
    secret: "JavaScript is soooooo cooool", 
    store: MongoStore.create({client: require('./database')}), 
    resave: false, 
    saveUninitialized: false, 
    cookie: {maxAge: 1000*60*60*24, httpOnly: true}
}); 

app.use(sessionOptions); 
app.use(flash()); 

app.use(function(req, res, next) {
    res.locals.user = req.session.user
    next()
})

const router = require('./router')

app.use(express.urlencoded({extended: false}))
app.use(express.json())

// console.log(router)
// Set views and engine
app.use('/public', express.static('public'));
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app