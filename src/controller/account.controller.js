const userModel = require("../model/user.model");
const accountModel = require("../model/account.model");

const createAccountController = async(req,res)=>{
    const user = req.user;

    const account = await accountModel.create({
        user:user._id
    })

    res.status(201).json({
        account
    })
}

const getAllAccountsController = async(req,res)=>{
    const user = req.user;  
    const accounts = await accountModel.find({
        user:user._id
    })
    res.status(200).json({
        accounts
    })
}

const getAccountBalanceController = async(req,res)=>{
    const user = req.user;
    const {accountId} = req.params;   
    const account = await accountModel.findOne({
        _id:accountId,
        user:user._id
    })

    if(!account){
        return res.status(404).json({
            message:"Account not foundd"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        accountId:account._id,
        balance:balance
    })
} 

module.exports = {createAccountController,getAllAccountsController,getAccountBalanceController};