const userModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const blackListModel = require("../model/blackList.model");

/**
 * - User Register controller
 * - Post /api/auth/register
 */
const userRegister = async(req,res)=>{
    const {email,name,password} = req.body;
    const isExist = await userModel.findOne({
        email:email
    });
    if(isExist){
        return res.status(422).json({
            message:"user is already registerd"
        })
    }

    try{

    // const hashPassword = await bcrypt.hash(password,10);
    const user = await userModel.create({
        email:email,
        name:name,
        password
    });

    const token = jwt.sign({
        id:user._id
    },process.env.JWT_SECRET_KEY,{expiresIn:"3d"});

    res.cookie("token",token);

    res.status(201).json({
        message:"user registerd successfully",
        user:{
            id:user._id,
            name:user.name,
            email:user.email
        },
        token
    }) 

    await emailService.sendRegisterationEmail(user.email,user.name);
    }catch(err){
        console.log(err);
        return res.status(409).json({message:"some thing went wrong in registeration"})
    }
}

/**
 * - User login Controller
 * - Post /api/auth/login
 */

const userLogin = async(req,res)=>{
    const{email,password} = req.body;
    const user = await userModel.findOne({
        email
    }).select("+password")
    if(!user){
        return res.status(401).json({message:"Email is not registered"})
    }

    const isValidPassword = await user.comparePassword(password);
    if(!isValidPassword){
        return res.status(401).json({
            message:"Password is incorrect"
        })
    }

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET_KEY,{expiresIn:"3d"});
    res.cookie("token",token);

    res.status(200).json({
        message:"user login successfully",
        user:{
            id:user._id,
            name:user.name,
            email:user.email
        }
    })

    await emailService.sendLoginNotificationEmail(user.email,user.name);    
}

/**
 * - User Logout Controller
 * - Post /api/auth/logout
 */
const userLogout = async(req,res)=>{
    const token = req.cookies.token||req.headers.authorization?.split(" ")[1];    
    if(!token){
        return res.status(400).json({
            message:"Token is required for logout"
        })
    }

    res.clearCookie("token");

    await blackListModel.create({
        token
    })  

    res.status(200).json({
        message:"User logged out successfully"
    })
}

module.exports = {userRegister,userLogin,userLogout};