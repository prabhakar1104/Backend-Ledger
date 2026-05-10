const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const blacklistModel = require("../model/blackList.model");
const blackListModel = require("../model/blackList.model");

const authMiddleware = async(req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthorize acess, token mising"
        })
    }

    const blackListedToken = await blackListModel.findOne({
        token
    })

    if(blackListedToken){
        return res.status(401).json({
            message:"Unauthorize acess, token is blacklisted"
        })
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);

        const user = await userModel.findById(decoded.id);

        req.user = user;

        next();
    }catch(err){
        console.log(err);
        return res.status(401).json({
            message:"Unauthorize acess, token error"
        })
    }
}

const systemAuthMiddleware = async(req,res,next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message:"Unauthorize acess, token mising"
        })
    }

    const blackListedToken = await blackListModel.findOne({
        token
    })

    if(blackListedToken){
        return res.status(401).json({
            message:"Unauthorize acess, token is blacklisted"
        })
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);   
        const user = await userModel.findById(decoded.id).select("+systemUser");

        if(!user.systemUser){
            return res.status(403).json({
                message:"Forbidden, system user only"
            })
        }  
        // console.log(user); 

        req.user = user;
        next();
    }catch(err){
        console.log(err);
        return res.status(401).json({ 
            message:"Unauthorize acess, token error"
        })
    }      
}

module.exports = {authMiddleware,systemAuthMiddleware};