const usersCollection = require('../database').collection('users'); 
const validator = require("validator")

let User = function(data) {
    this.data = data
    this.errors = []
}

User.prototype.cleanUp = function() {
    if(typeof(this.data.username) != "string") {this.data.username = ""}
    if(typeof(this.data.email) != "string") {this.data.email = ""}
    if(typeof(this.data.password) != "string") {this.data.password = ""}

    // Get rid of any bogus properties 
    this.data = {
        username: this.data.username.trim().toLowerCase(), 
        email: this.data.email.trim().toLowerCase(), 
        password: this.data.password
    }
}

User.prototype.validate = function() {
    if(this.data.username == "") {this.errors.push("You must provide a username.")}
    if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.errors.push("Username can only contain letters and numbers.")}
    if(!validator.isEmail(this.data.email)) {this.errors.push("You must provide a valid email address.")}
    if(this.data.password == "") {this.errors.push("You must provide a password.")}
    if(this.data.password.length > 0 && this.data.password.length < 8) {this.errors.push("Password must be atleast 8 character.")}
    if(this.data.password.length > 100) {this.errors.push("Password cannot exceed 100 character.")}
    if(this.data.username.length > 0 && this.data.username.length < 3) {this.errors.push("Username must be atleast 3 character.")}
    if(this.data.username.length >30) {this.errors.push("Username cannot exceed 30 character.")}
}

User.prototype.register = function() {
    // Step#1: Validate user data
    this.cleanUp()
    this.validate()

    //
    //
    if(!this.errors.length) {
        usersCollection.insertOne(this.data)
    }
}

User.prototype.login = function(callback) {
    return new Promise((resolve, reject) => {
        this.cleanUp(); 
        usersCollection.findOne({username: this.data.username}).then((attemptedUser) => {
            if(attemptedUser && attemptedUser.password == this.data.password) {
                resolve("Congrats!!!")
            } else {
                reject("Invalid username or password")
            }
        }).catch(function() {
            reject("Please try again later.")
        })
    })
}

module.exports = User