const express = require('express')
const router = express.Router(); 
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const followController = require('./controllers/followController')

router.get('/', userController.home)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout)

// Post related routes
router.get('/create-post', userController.authenticate, postController.viewCreateScreen)
router.post('/create-post', userController.authenticate, postController.create)
router.get('/post/:id', postController.viewSingle)
router.get('/post/:id/edit', userController.authenticate, postController.viewEditScreen)
router.post('/post/:id/edit', userController.authenticate, postController.edit)
router.post('/post/:id/delete', userController.authenticate, postController.delete)
router.post('/search', postController.search)

// Profile related routes
router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostScreen)

// Follow related routes
router.post('/addFollow/:username', userController.ifUserExists, followController.addFollow)
router.post('/removeFollow/:username', userController.ifUserExists, followController.removeFollow)

module.exports = router