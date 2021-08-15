const postsCollection = require('../database').db().collection("posts")
const {ObjectId} = require('mongodb')
const User = require('./User')

let Post = function(data, userid) {
  this.data = data
  this.errors = []
  this.userid = userid
}

Post.prototype.cleanUp = function() {
  if (typeof(this.data.title) != "string") {this.data.title = ""}
  if (typeof(this.data.body) != "string") {this.data.body = ""}

  // get rid of any bogus properties
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    created_at: new Date(),
    created_by: ObjectId(this.userid)
  }
}

Post.prototype.validate = function() {
  if (this.data.title == "") {this.errors.push("You must provide a title.")}
  if (this.data.body == "") {this.errors.push("You must provide post content.")}
}

Post.prototype.create = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp(); 
        this.validate(); 
    
        if (!this.errors.length) {
            // save post into database
            await postsCollection.insertOne(this.data).then(() => {
                resolve()
            }).catch(() => {
                this.errors.push("Please try again later.")
                reject(this.errors)
            })
        } else {
            reject(this.errors)
        } 
  })
}
// {$match: {_id: new ObjectId(id)}},
Post.reusablePostQuery = function(uniqueOperations) {
    return new Promise(async function(resolve, reject) {
        let aggOperations = uniqueOperations.concat([
            {$lookup: {from: "users", localField: "created_by", foreignField: "_id", as: "authorDocument"}},
            {$project: {
                title: 1, 
                body: 1, 
                created_at: 1, 
                author: {$arrayElemAt: ["$authorDocument", 0]}
            }}
        ])

        // let post = await postsCollection.findOne({_id: ObjectId(id)})
        let posts = await postsCollection.aggregate(aggOperations).toArray()

        // Clean up author property in each post object
        posts = posts.map((post) => {
            post.author = {
                username: post.author.username, 
                avatar: new User(post.author, true).avatar
            }
            return post
        })

        resolve(posts)
    })
}

Post.findSingleById = function(id) {
    return new Promise(async (reslove, reject) => {
        if(typeof(id) != "string" || !ObjectId.isValid(id)) {
            reject()
            return
        }

        // let post = await postsCollection.findOne({_id: ObjectId(id)})
        let posts = await Post.reusablePostQuery([
            {$match: {_id: new ObjectId(id)}}
        ])

        if(posts.length) {
            reslove(posts[0])
        } else {
            reject()
        }
    })
}

Post.findByAuthorId = function(authorId) {
    return Post.reusablePostQuery([
        {$match: {created_by: authorId}}, 
        {$sort: {created_at: -1}}
    ])
}

module.exports = Post