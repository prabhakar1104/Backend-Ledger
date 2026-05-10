const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        require:[true,"Ledger must be associated with account"],
        index:true,
        immutable:true
    },
    ammount:{
        type:Number,
        required:[true,"Amount is requried for creating a ledger entry"],
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"Ledger must be associated with transaction"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"Type can be either credit or debit"
        },
        requierd:[true,"Ledger type is required"],
        immutable:true
    }
})

function preventLedgerModification(){
    throw new Error("Ledger Entries are immutable and cannot be changed");
}

ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);
ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('deleteOne',preventLedgerModification);
ledgerSchema.pre('remove',preventLedgerModification);
ledgerSchema.pre('deleteMany',preventLedgerModification);
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);
ledgerSchema.pre('updateMany',preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification);
ledgerSchema.pre('replaceOne',preventLedgerModification);


const ledgerModel = mongoose.model("ledger",ledgerSchema);

module.exports = ledgerModel;