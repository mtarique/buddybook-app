const User = require('../models/User')

exports.home = function(req, res) {
    if(req.session.user) {
        res.render("home-dashboard", {username: req.session.user.username})
    } else {
        res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')})
    }
}

exports.register = function(req, res) { 
    let user = new User(req.body)

    user.register()
    
    if(user.errors.length) {
        user.errors.forEach(function(error) {
            req.flash('regErrors', error)
        })

        // Redirect only if error flash session saved in db
        req.session.save(function() {
            res.redirect('/')
        })
    } else {
        res.send("Congrats, there are no errors.")
    }
}

exports.login = (req, res) => {
    let user = new User(req.body)
    user.login().then(function(result) {
        req.session.user = {favColor: "blue", username: user.data.username}
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