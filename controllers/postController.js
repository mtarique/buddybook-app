const Post = require('../models/Post')

exports.viewCreateScreen = function(req, res) {
  res.render('create-post')
}

exports.create = function(req, res) {
  let post = new Post(req.body, req.session.user._id)
  post.create().then(() => {
    res.send("New post created.")
  }).catch((e) => {
    res.send(e)
  })
}

exports.viewSingle = async function(req, res) {
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        res.render('single-post-screen', {post: post})
    } catch {
        res.render('404')
    }
}

exports.viewEditScreen = async function(req, res) {
  try {
    let post = await Post.findSingleById(req.params.id)
    res.render('edit-post', {post: post})  
  } catch (error) {
    res.render('404')
  }
}

exports.edit = function(req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id)

  post.update().then((status) => {
    // the post was successfully updated 
    // or user did have permission but there validation errors
    if(status = "success") {
      //Post updated 
      req.flash("success", "Post successfully updated.")

      req.session.save(function() {
        res.redirect(`/post/${req.params.id}/edit`)
      })
    } else {
      // Validation erros
      post.errors.forEach(function() {
        req.flash("errors", error)
      }) 

      req.session.save()

      res.redirect(`/post/${req.params.id}/edit`)
    }
  }).catch((e) => {
    // A post with request id doesn't exist
    // or if the current visitor is not the owner of the post
    req.flash("errors", "You do not have permission to perform this action.")
    req.session.save(function() {
      res.redirect('/')
    })
  })
}