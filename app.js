const express = require('express')
const app = express(); 
const router = require('./router')

// console.log(router)
// Set views and engine
app.use('/public', express.static('public'));
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

app.listen(3000)