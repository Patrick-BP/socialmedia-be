const express = require('express')
const {createUser, updateUser, getUser, followAUser, unfollowAUser, getFriends} = require('../Controllers/usersController');
const route = express.Router();


route.post("/register", createUser);
route.put('/:id', updateUser);
route.get('/', getUser );
route.put('/:id/follow', followAUser);
route.put('/:id/unfollow', unfollowAUser);
route.post('/friends/:userId', getFriends)

module.exports = route;