const mongoose = require("mongoose");

const blackListSchmea = new mongoose.Schema({
    token:{
        type:String,
        required:[true,"Token is required to blacklist"],
        unique:[true,"token is already blacklisted"]
    },
    blackListedAt:{
        type:Date,
        default:Date.now,
        immutable:true
    }

},{timestamps:true})

blackListSchmea.index({createdAt:1},{expireAfterSeconds:60*60*24*3})

const blackListModel = mongoose.model("blackList",blackListSchmea);

module.exports = blackListModel;
