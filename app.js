const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const flash = require('connect-flash')
const markdown = require('marked')
const sanitizeHTML = require('sanitize-html')
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
    // make our markdown function available from within ejs template
    res.locals.filterUserHTML = function(content) {
        return sanitizeHTML(markdown(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: []})
    }
    // make all error and success and flash messages available from 
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")
    // make current user id available on the request object
    if(req.session.user) {req.visitorId = req.session.user._id} else {req.visitorId = 0}

    // make user session data available from within view templates
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