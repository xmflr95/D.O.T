// config/passport.js //
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/User");

// serialize & deserialize User
// seializeUser는 login시 db정보 저장 user의 id만 세션에 저장하도록 설정
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    User.findOne({
        _id: id
    }, function (err, user) {
        done(err, user);
    });
});

// local strategy 설정
passport.use("local-login",
    new LocalStrategy({
            usernameField: "username",
            passwordField: "password",
            passReqToCallback: true
        },
        function (req, username, password, done) {
            User.findOne({
                    username: username
                })
                .select({
                    password: 1
                })
                .exec(function (err, user) {
                    if (err) return done(err);

                    if (user && user.authenticate(password)) {
                        return done(null, user);
                        // 인증성공 = user값을 담은 done 리턴
                    } else {
                        req.flash("username", username);
                        req.flash("errors", {
                            login: "닉네임과 비밀번호가 일치하지 않습니다."
                        });
                        return done(null, false);
                    }
                });
        }
    )
);

module.exports = passport;
