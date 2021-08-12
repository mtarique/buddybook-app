const express = require('express')
const router = express.Router(); 
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')

router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// Post related routes
router.get('/create-post', userController.authenticate, postController.viewCreateScreen)
router.post('/create-post', userController.authenticate, postController.create)

module.exports = router