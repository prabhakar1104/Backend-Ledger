require('dotenv').config();
const app = require("./src/app");
const dbConnect = require("./src/config/db");
dbConnect();

app.listen(3000,()=>{
    console.log('server is running on port 3000');
})