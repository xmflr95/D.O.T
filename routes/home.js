// routes/home/js

var express = require('express');
var router = express.Router();
var passport = require("../config/passport");

// HOME 화면
router.get("/", (req, res) => {
    res.render("home/welcome");
});

// login-1
router.get("/login", (req, res) => {
    var username = req.flash("username")[0];
    var errors = req.flash("errors")[0] || {};
    res.render("home/login", {
        username: username,
        errors: errors
    });
});

// login-2
router.post("/login", function (req, res, next) {
    var errors = {};
    var isValid = true;
    if (!req.body.username) {
        isValid = false;
        errors.username = "Username is Required!";
    }
    if (!req.body.password) {
        isValid = false;
        errors.password = "Password is Required!";
    }
    if (isValid) {
        next();
    } else {
        req.flash("errors", errors);
        res.redirect("/login");
    }
}, passport.authenticate("local-login", {
    successRedirect: "/posts",
    failureRedirect: "/login"
}));

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

//router.get("/adduser", (req, res) => {
//    res.render("users/new");
//});

router.get("/about", (req, res) => {
    res.render("home/about");
});

module.exports = router;
