const User = require('../models/User')

exports.home = function(req, res) {
    if(req.session.user) {
        res.render("home-dashboard")
    } else {
        res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')})
    }
}

exports.register = function(req, res) { 
    let user = new User(req.body)
    user.register().then(() => {
        req.session.user = {username: user.data.username, avatar: user.avatar}
        req.session.save(function() {
            res.redirect('/')
        })
    }).catch((regErrors) => {
        regErrors.forEach(function(error) {
            req.flash('regErrors', error)
        })

        // Redirect only if error flash session saved in db
        req.session.save(function() {
            res.redirect('/')
        })
    })
}

exports.authenticate = (req, res, next) => {
    if(req.session.user) {
        next()
    } else {
        req.flash("errors", "You must be logged in to perform this action.")

        req.session.save(function() {
            res.redirect('/')
        })
    }
}

exports.login = (req, res) => {
    let user = new User(req.body)
    user.login().then(function(result) {
        req.session.user = {avatar: user.avatar, username: user.data.username}
        req.session.save(function(){
            res.redirect('/'); 
        })
    }).catch(function(e) {
        req.flash('errors', e)
        req.session.save(function() {
            res.redirect('/')
        })
        res.redirect('/')
    })
}

exports.logout = (req, res) => {
    req.session.destroy(function() {
        res.redirect('/')
    }); 
}