const express = require('express')
const {createPost, updatePost, deletePost, like, getPost, getTimeLine, getAllUserPosts } = require('../Controllers/postsController');
const route = express.Router();

route.post("/", createPost);
route.put('/:id', updatePost);
route.delete('/:id', deletePost)
route.put('/:id/like', like);
route.get('/:id', getPost);
route.get('/timeline/:userId', getTimeLine);
route.get('/profile/:username', getAllUserPosts);
module.exports = route;