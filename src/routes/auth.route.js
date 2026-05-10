const express = require("express");
const router = express.Router();
const userController = require("../controller/auth.controller");

/**
 * Post /api/auth/register
 */
router.post("/register",userController.userRegister);
router.post("/login",userController.userLogin)

/**
 * post /api/auth/logout
 */

router.post("/logout",userController.userLogout);

module.exports = router;