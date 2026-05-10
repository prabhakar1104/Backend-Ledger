const express = require("express");
const cookieParser = require("cookie-parser")

const app = express();
app.use(express.json());
app.use(cookieParser());

/**
 * Route fetching
 */
const authRoute = require("./routes/auth.route");
const accountRoute = require("./routes/account.route");
const TransactionRoute = require("./routes/transaction.route");

/**
 * Route endPoints 
 */
app.use("/api/auth/",authRoute);
app.use("/api/account",accountRoute);
app.use("/api/transaction",TransactionRoute);

module.exports = app;