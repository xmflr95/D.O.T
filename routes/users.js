// routes/users.js
var express = require("express");
var router = express.Router();
var User = require("../models/User");
var util = require("../util");

// Index
router.get("/", util.isLoggedin, function (req, res) {
    User.find({})
        .sort({
            username: 1
        })
        .exec(function (err, users) {
            if (err) return res.json(err);
            res.render("users/index", {
                users: users
            });
        });
});

// New
router.get("/new", function (req, res) {
    // create route에서 생성도니 flash값을 받아옴, 처음이면
    // || {}를 사용해서 빈 오브젝트를 넣어서 user/new 페이지 생성
    var user = req.flash("user")[0] || {};
    var errors = req.flash("errors")[0] || {};
    res.render("users/new", {
        user: user,
        errors: errors
    });
});

// create
router.post("/", function (req, res) {
    User.create(req.body, function (err, user) {
        if (err) { // 오류 시 user, error flash 만들어서 new 페이지로 redirect
            req.flash("user", req.body);
            req.flash("errors", util.parseError(err)); // 따로만든 오류함수
            return res.redirect("/users/new");
        }
        res.redirect("/users");
    });
});

// show
router.get("/:username", util.isLoggedin, function (req, res) {
    User.findOne({
        username: req.params.username
    }, function (err, user) {
        if (err) return res.json(err);
        res.render("users/show", {
            user: user
        });
    });
});

// edit
router.get("/:username/edit", util.isLoggedin, checkPermission, function (req, res) {
    // 처음 접속의 경우 DB에서 값을 찾아 form에 기본값을 생성,
    // update에서 오류가 발생해 돌아오는 경우에는 기존에 입력했던 값으로
    // form값을 생성, 이를 위해
    var user = req.flash("user")[0]; // || {} 사용 x
    var errors = req.flash("errors")[0] || {};
    if (!user) { // user flash값이 있으면 오류가 있는 경우
        User.findOne({
            username: req.params.username
        }, function (err, user) {
            if (err) return res.json(err);
            res.render("users/edit", {
                username: req.params.username,
                user: user,
                errors: errors
            });
        });
    } else { // user flash값이 없으면 처음 들어온 경우
        res.render("users/edit", {
            username: req.params.username,
            user: user,
            errors: errors
        });
    }
});
// render시 username을 따로 보내는 이유는 user.username이 항상 해당 user의 username
// 이였다가 이젠 user flash값을 받는경우 username이 달라 질수도 있다. 주소의 username사용!

// update
router.put("/:username", util.isLoggedin, checkPermission, function (req, res, next) {
    User.findOne({
            username: req.params.username
        })
        .select({
            password: 1
        })
        .exec(function (err, user) {
            if (err) return res.json(err);

            // update user object
            user.originalPassword = user.password;
            user.password = req.body.newPassword ? req.body.newPassword : user.password;
            for (var p in req.body) {
                user[p] = req.body[p];
            }

            // save updated user
            user.save(function (err, user) {
                if (err) {
                    req.flash("user", req.body);
                    req.flash("errors", util.parseError(err));
                    return res.redirect("/users/" + req.params.username + "/edit");
                }
                res.redirect("/users/" + user.username);
            });
        });
});

module.exports = router;

// private functions
function checkPermission(req, res, next) {
    User.findOne({
        username: req.params.username
    }, function (err, user) {
        if (err) return res.json(err);
        if (user.id != req.user.id) return util.noPermission(req, res);

        next();
    });
}
