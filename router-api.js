const express = require('express')
const apiRouter = express.Router(); 
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const followController = require('./controllers/followController')
const cors = require('cors')

apiRouter.use(cors())

apiRouter.post('/login', userController.apiLogin); 
apiRouter.post('/create-post', userController.apiIfUserExists, postController.apiCreate)
apiRouter.delete('/post/:id', userController.apiIfUserExists, postController.apiDelete)
apiRouter.get('/postsByAuthor/:username', userController.apiGetPostsByUsername)
module.exports = apiRouter