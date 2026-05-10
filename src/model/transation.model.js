const mongoose = require("mongoose");

const transationSchema = new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transation must be associated with a from account"],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transation must be associated with a to account"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message:"Status can be either Pending, completed, failed or reverse"
        },
        default:"Pending"
    },
    ammount:{
        type:Number,
        required:[true,"amount is required to creating for transation"],
        min:[0,"Transation Amount cannot be negative"]
    },
    idempotencyKey:{
        type:String,
        required:[true,"IdempotencyKey is required for creating a transaction"],
        index:true,
        unique:true
    }
},{timestamps:true});

const transactionModel = mongoose.model("transaction",transationSchema);

module.exports = transactionModel;