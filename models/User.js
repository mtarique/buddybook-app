const usersCollection = require('../database').db().collection('users'); 
const validator = require("validator"); 
const bcrypt = require('bcryptjs'); 
const md5 = require('md5'); 

let User = function(data, getAvatar) {
    this.data = data
    this.errors = []
    if(getAvatar == undefined) {
        getAvatar = false
    } 

    if(getAvatar) {
        this.getAvatar()
    }
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
    return new Promise(async (resolve, reject) => {
        if(this.data.username == "") {this.errors.push("You must provide a username.")}
        if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.errors.push("Username can only contain letters and numbers.")}
        if(!validator.isEmail(this.data.email)) {this.errors.push("You must provide a valid email address.")}
        if(this.data.password == "") {this.errors.push("You must provide a password.")}
        if(this.data.password.length > 0 && this.data.password.length < 8) {this.errors.push("Password must be atleast 8 character.")}
        if(this.data.password.length > 50) {this.errors.push("Password cannot exceed 50 character.")} // bcrypt accept 50 chars max
        if(this.data.username.length > 0 && this.data.username.length < 3) {this.errors.push("Username must be atleast 3 character.")}
        if(this.data.username.length >30) {this.errors.push("Username cannot exceed 30 character.")}
    
        // Only if username is valid check to see if it's already taken
        if(this.data.username.length > 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)) {
            let usernameExists = await usersCollection.findOne({username: this.data.username})
            if(usernameExists) {this.errors.push("That username is already taken.")}
        }
    
        // Only if email is valid check to see if it's already taken
        if(validator.isEmail(this.data.email)) {
            let emailExists = await usersCollection.findOne({email: this.data.email})
            if(emailExists) {this.errors.push("That email is already being used.")}
        }

        resolve(); 
    })
}

User.prototype.register = function() {
    return new Promise(async (resolve, reject) => {
        // Step#1: Validate user data
        this.cleanUp()
        await this.validate()
    
        // If no errors occurred
        if(!this.errors.length) {
            // Hash user password
            let salt = bcrypt.genSaltSync(10); 
            this.data.password = bcrypt.hashSync(this.data.password, salt); 
            await usersCollection.insertOne(this.data)
            this.getAvatar()
            resolve()
        } else {
            reject(this.errors)
        }
    })
}

User.prototype.login = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp(); 
        usersCollection.findOne({username: this.data.username}).then((attemptedUser) => {
            if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
                this.data = attemptedUser
                this.getAvatar()
                resolve("Congrats!!!")
            } else {
                reject("Invalid username or password")
            }
        }).catch(function() {
            reject("Please try again later.")
        })
    })
}

User.prototype.getAvatar = function() {
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

User.findByUsername = function(username) {
    return new Promise(function(resolve, reject) {
        if(typeof(username) != "string") {
            reject()
            return
        }

        usersCollection.findOne({username: username}).then(function(userDoc) {
            if(userDoc) {
                userDoc = new User(userDoc, true)
                userDoc = {
                    _id: userDoc.data._id, 
                    username: userDoc.data.username, 
                    avatar: userDoc.avatar
                }
                resolve(userDoc)
            } else {
                reject()
            }
        }).catch(function() {
            reject()
        })
    })
}

User.doesEmailExist = function(email) {
    return new Promise(async function(resolve, reject) {
        if(typeof(email) != "string") {
            resolve(false); 
            return 
        }

        let user = await usersCollection.findOne({email: email})

        if(user) {
            resolve(true)
        } else {
            resolve(false)
        }
    }); 
}

module.exports = User