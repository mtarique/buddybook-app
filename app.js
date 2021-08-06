const express = require('express')
const session = require('express-session')
const app = express(); 

let sessionOptions = session({
    secret: "JavaScript is soooooo cooool", 
    resave: false, 
    saveUninitialized: false, 
    cookie: {maxAge: 1000*60*60*24, httpOnly: true}
}); 

app.use(sessionOptions); 

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