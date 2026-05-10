const mongoose = require("mongoose");

const dbConnect = async()=>{
    try{
        await mongoose.connect(process.env.DATABASE_URI);
        console.log("Database connected successfully");
        
    }catch(err){
        console.log("database connection failed",err);
        process.exit(1);
    }
}

module.exports = dbConnect;