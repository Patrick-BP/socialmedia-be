const express = require('express');
const User = require('../Models/usersModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

exports.createUser = async (req, res)=>{
    const findEmail = await User.findOne({email:req.body.email});
    const findUsername = await User.findOne({username:req.body.username});

    if(!findUsername){
        if(!findEmail){
            const salt = await bcrypt.genSalt(10);
            const cryptedPass = await bcrypt.hash(req.body.password, salt);
            const newUser = {
                username: req.body.username,
                email: req.body.email,
                password: cryptedPass
            } 
            try{
               
               const user = await new User(newUser).save();
                res.status(200).json(user) 
            }catch(err){
                res.status(500).json("user was not saved")    
            }
            
        }else{
            res.status(403).json("Email is taken")  
        }

    }else{
        res.status(403).json("user name is taken")  
    }
    

};


exports.login = async(req, res)=>{
    const {email, password} = req.body;

    try{
        const findUser = await User.findOne({email});
        
        if(findUser){
            const verifyPassword = await bcrypt.compare(password, findUser.password);
            
            if(!verifyPassword){
                res.status(400).json("password is incorrect");
            }else{
              
              const { 
                _id,
                username,
                email,
                profilePicture,
                coverPicture,
                followings,
                followers,
                isAdmin,
                createdAt,} = findUser  
                res.status(200).json({
                    _id,
                    username,
                    email,
                    profilePicture,
                    coverPicture,
                    followings,
                    followers,
                    isAdmin,
                    createdAt,
                 })
                
            }
        }else{
            res.status(404).json("user not found!")
        }
    }catch(err){
        res.status(500).json("Failed to log in")
    }

}

exports.updateUser = async (req, res)=>{
    if(req.body.userId === erq.params.id || req.user.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);

            }catch(err){
                res.status(500).json(err)
            }
        }
            try{
                const user = await User.findByIdAndUpdate(req.params.id, {$set:req.body})
            }catch(err){
                
            }
    }else{
            return res.status(403).json("You can update only your account")
        }


};

exports.getUser = async (req, res)=>{
    const userId = req.query.userId;
    const username = req.query.username;
    try{
        const user = userId ? await User.findById(userId): await User.findOne({username: username});
        const {password, updateAt, ...other} = user._doc;
        res.status(200).json(other)}
        catch(err){
        res.status(500).json(err)
    }
};

exports.delete = async(req, res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        try{
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted")
        }catch(error){
            return res.status(500).json(error)
        }
    }else{
        return res.status(403).json("You can delete only your account")
    }
};


exports.followAUser =  async (req, res)=>{
    if(req.body.userId !== req.params.id ){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push:{followers:req.body.userId}});
                await currentUser.updateOne({$push:{followings:req.params.id}});
                res.status(200).json("user has been followed");
            }else{
                res.status(403).json("you are already following this user");
            }

        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(403).json("You cant follow yourself");
    }
};

exports.unfollowAUser =  async (req, res)=>{
    if(req.body.userId !== req.params.id ){
        try{
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers:req.body.userId}});
                await currentUser.updateOne({$pull:{followings:req.params.id}});
                res.status(200).json("user has been Unfollowed");
            }else{
                res.status(403).json("you are already this user");
            }

        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(403).json("You cant follow yourself");
    }
};

exports.getFriends = async (req, res)=>{
    try{
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map(friendId=>{
                return User.findById(friendId)
            })
        )
        let friendList = [];
        friends.map(friend=>{
            const {_id, username, profilePicture} = friend;
            friendList.push({_id, username, profilePicture})
        });
        res.status(200).json(friendList)
    }catch(err){
        res.status(500).json(err)
    }
}