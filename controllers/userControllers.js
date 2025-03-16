import User from "../models/userModels.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Photo from "../models/photoModels.js";
import mongoose from "mongoose";



const userCreate = async (req,res)=>{
    try{
        const user = await User.create(req.body);
        res.status(201).json( {user: user._id } );   
        
    } catch(error){
    
        let errors2 = {}

        if(error.name === "ValidationError"){
            Object.keys(error.errors).forEach((key) => {
                errors2[key] = error.errors[key].message;
            })
        }
        
        if(error.code === 11000){
            errors2.email = "The email is already registered."
        }
        
        res.status(400).json(errors2);
    }
};

const loginUser = async (req,res) => {
    try {
        const {nameSurname, password} = req.body;
        
        const user = await User.findOne({nameSurname: nameSurname})
       
        let same = false;
        
        if(user){
            same = await bcrypt.compare(password, user.password)
        }else {
            return res.status(401).json({
                suuceeded: false,
                error: 'There is no such user'
            })
        }

        if(same){
            const token =  createToken(user._id);
            res.cookie("jsonwebtoken", token, {
                httpOnly:true,
                maxAge: 1000*60*60*24,
            })

            res.redirect("/users/dashboard");
            
        } else{
             res.status(401).json({
                succeeded: false,
                error: 'Password are not matched',
            });
        }
    } catch {
        res.status(500).json({
            succeeded: false,
            error,
        });
    }
}

const createToken = (userId) => {
    return jwt.sign(
        {userId}, 
        process.env.JWT_SECRET, 
        { expiresIn:'1d'}
    );
}

const getDashboardPage = async(req,res)=>{
    const photos = await Photo.find({ user: res.locals.user._id });
    const user = await User.findById({_id:res.locals.user._id  }).populate(['followings','followers']);
    
    
    res.render("dashboard",{
        link : 'dashborad',
        photos,
        user,
    });
}


const getAllUsers = async(req,res) => {
   
    try{
        const users = await User.find({ _id: {$ne: res.locals.user._id}});
        res.status(201).render('users',{
            link: 'users',
            users,
        })
    } catch{
        res.status(500).json({
            succeeded : false,
            error:"Kullanilar Cekilemedi",
            details: error.message,
        });
    }
} 

const getAUser = async(req,res) =>{
    
        const isValidId = mongoose.Types.ObjectId.isValid(req.params.id)
        if(!isValidId){
            res.status(404).json({
                succeeded: false,
                error: "Id is not found",
                details: error.message
            });
            return;
        }
    try{
         const user = await User.findById(req.params.id);
    
        const inFollowers = user.followers.includes(res.locals.user._id);

        const photos = await Photo.find({ user: user._id});

        if(!user){
            res.status(404).json({
                succeeded : false,
                error: "User is not found",
                details : error.message,
            })
            return;
        }
        res.status(201).render('user',{
            link : 'user',
            photos,
            user,
            inFollowers,
            userLocal:res.locals.user.nameSurname,
        });
    }catch(error) {
        res.status(500).json({
            succeeded: false,
            error: "server error",
            details: error.message,
        });
    }
}

const getFollowAUser = async(req,res) => {
    
    try{
    let user =   await User.findByIdAndUpdate(
            {_id: req.params.id},
            {
                $push: {followers: res.locals.user._id}
            },
            {new: true}
        );

        if (!user){
            return res.status(404).json({
             error: "follower's user is Not Found",
             details : error.details
            })
         }

        user = await User.findByIdAndUpdate(
            {_id : res.locals.user._id},
            {
                $push:{followings: req.params.id},
            },
            {new: true},
        );

        
        if (!user){
            return res.status(404).json({
                error:"following's user is Not Found",
                details : error.details
            })
        }
        res.status(200).redirect(`/users/${req.params.id}`);
        
    } catch (error){
        if(error){
            res.status(500).json({
                error: "Server Error",
                details: error.message,
            })
        }
        else if (error.name === 'ValidationError') {
            res.status(400).json({
                error: "Invalid data",
                details: error.details,
            })
        }
        else if (error.code === 11000) {
            res.status(409).json({
                error: "Have been already followers"
            })
        }
    }
    
   
}



const getUnfollowAUser = async(req,res) => {
    
    try{
    let user =   await User.findByIdAndUpdate(
            {_id: req.params.id},
            {
                $pull: {followers: res.locals.user._id}
            },
            {new: true}
        );

        if (!user){
            return res.status(404).json({
             error: "unfollower's user is Not Found",
             details : error.details
            })
         }

        user = await User.findByIdAndUpdate(
            {_id : res.locals.user._id},
            {
                $pull:{followings: req.params.id},
            },
            {new: true},
        );

        if (!user){
            return res.status(404).json({
             error:"unfollowing's user is Not Found",
             details : error.details
            })
         }
 
         res.status(200).redirect(`/users/${req.params.id}`);
        
        
    } catch (error){
        if(error){
            res.status(500).json({
                error: "Server Error",
                details: error.message,
            })
        }
        else if (error.name === 'ValidationError') {
            res.status(400).json({
                error: "Invalid data",
                details: error.details,
            })
        }
        else if (error.code === 11000) {
            res.status(409).json({
                error: "Have been already followers"
            })
        }
    }
}

export { userCreate, 
    loginUser, 
    getDashboardPage,  
    getAllUsers, 
    getAUser, 
    getFollowAUser,
    getUnfollowAUser,
    };