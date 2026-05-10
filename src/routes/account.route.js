const express = require("express");
const router = express.Router();
const accountController = require("../controller/account.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @route POST /api/auth/account
 * @desc Create a new account for the authenticated user
 */
router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)

/**
 * - Get all accout of the logged in user
 * - Protected Route
 */

router.get("/",authMiddleware.authMiddleware,accountController.getAllAccountsController)

/**
 * - Get api/account/balacne/:accountId
 * - Get balance of the logged in user
 */

router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceController)

module.exports = router;