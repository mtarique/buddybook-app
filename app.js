const express = require('express')
const app = express(); 

// Set views and engine
app.use('/public', express.static('public'));
app.set('views', 'views')
app.set('view engine', 'ejs')

app.get('/', function(req, res) {
    res.render('home-guest')
})

app.listen(3000)