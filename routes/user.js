const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/users.js");

router.route("/signup")
   .get(userController.renderSignupForm)
   .post(wrapAsync(userController.signup));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate("local", {      //when we login saveRedirectUrl will save the previous url then we login   //passport.authenticate is a middleware which identifies if the user exist or not in db.and local we have to pass with it.
        failureRedirect: "/login",                               //it redirects to login page if authentication fails.
        failureFlash: true,                                     //for a flash msg after failure of authentication by any reason.
    }),
    userController.login
);

// router.get("/signup", userController.renderSignupForm);

// router.post("/signup", wrapAsync(userController.signup));

// router.get("/login", userController.renderLoginForm);

// router.post("/login", saveRedirectUrl, passport.authenticate("local", {      //when we login saveRedirectUrl will save the previous url then we login   //passport.authenticate is a middleware which identifies if the user exist or not in db.and local we have to pass with it.
//         failureRedirect: "/login",                               //it redirects to login page if authentication fails.
//         failureFlash: true,                                     //for a flash msg after failure of authentication by any reason.
//     }),
//     userController.login
// );

router.get("/logout", userController.logout);

module.exports = router;