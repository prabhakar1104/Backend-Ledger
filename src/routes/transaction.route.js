const express = require("express");
const route = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const transactionController = require("../controller/transaction.controller");


route.post(
  "/",
  authMiddleware.authMiddleware,
  transactionController.createTransaction,
);

/**
 * - Post /api/transaction/system/initial-funds
 * - Create initial funds for the system user
 */
route.post(
  "/system/initial-funds",
  authMiddleware.systemAuthMiddleware,
  transactionController.createInitialFundTransaction,
);

module.exports = route;
