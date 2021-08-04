const dotenv = require('dotenv'); 
dotenv.config(); 
const {MongoClient} = require('mongodb');

MongoClient.connect(process.env.CONNECTIONSTRING, {useNewUrlParser: true}, function(err, client) {
    if(err) throw err; 
    module.exports = client.db()

    const app = require('./app')
    app.listen(process.env.PORT)
})





