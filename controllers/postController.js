const Post = require('../models/Post')

exports.viewCreateScreen = function(req, res) {
  res.render('create-post',  {title: "Create New Post"})
}

exports.create = function(req, res) {
  let post = new Post(req.body, req.session.user._id)
  post.create().then((newPostId) => {
    req.flash("success", "New post successfully created.")
    req.session.save(() => res.redirect(`/post/${newPostId}`))
  }).catch((errors) => {
    errors.forEach(error => req.flash("errors", error))
    req.session.save(() => res.redirect("/create-post"))
  })
}

exports.apiCreate = function(req, res) {
  let post = new Post(req.body, req.apiUser._id)
  post.create().then((newPostId) => {
    res.json("Congrats!")
  }).catch((errors) => {
    res.json(errors)
  })
}

exports.viewSingle = async function(req, res) {
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        res.render('single-post-screen', {post: post, title: post.title})
    } catch {
        res.render('404')
    }
}

exports.viewEditScreen = async function(req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId)

    //console.log(post)
    if(post.isVisitorOwner) {
      res.render('edit-post', {post: post, title: "Edit Post"})  
    } else {
      req.flash("errors", "You do not have permission to perform this action.")
      req.session.save(() => res.redirect("/"))
      //console.log(errors)
    }
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

exports.delete = function(req, res) {
  Post.delete(req.params.id, req.visitorId).then(() => {
    req.flash("success", "Post successfully deleted.")
    req.session.save(() => res.redirect(`/profile/${req.session.user.username}`))
  }).catch(() => {
    req.flash("errors", "You do not have permission to perform that action.")
    req.session.save(() => res.redirect("/"))
  })
}

exports.apiDelete = function(req, res) {
  Post.delete(req.params.id, req.apiUser._id).then(() => {
    res.json("Successfully deleted!")
  }).catch(() => {
    res.json("You do not have permission to perform that action.")
  })
}

exports.search = function(req, res) {
  Post.search(req.body.searchTerm).then(posts => {
    res.json(posts)
  }).catch(() => {
    res.json([])
  }); 
}