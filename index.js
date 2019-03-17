// index.js

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require("connect-flash"); // 플래쉬
// req.flash(문자열, 저장할_값) : 저장할_값(어떤 오브젝트도 가능)을 해당 문자열에 저장
// flash는 배열로 저장, 같은 문자열 중복해서 사용하면 순서대로 배열로 저장됨.
// req.flash(문자열)인 경우 해당 문자열에 저장된 값들을 배열로 불러옴. 값이 없다면 [](빈배열) return
var session = require("express-session"); // 세션
var passport = require('./config/passport'); // passport
var multer = require("multer");

var app = express();

var MONGO_DB = "mongodb://dbuser:dbuser123@ds123434.mlab.com:23434/men_website";
// DB 세팅
mongoose.connect(MONGO_DB, {
    useNewUrlParser: true
}); // 1
var db = mongoose.connection;
db.once("open", function () {
    console.log('DB connected');
});
db.on('error', function (err) {
    console.log('DB ERROR : ', err);
});

// Other settings
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride("_method"));
app.use(flash()); // flash 초기화
app.use(session({
    secret: "MySecret", // 패스포트 연결때 필수
    resave: true,
    saveUninitialized: true
}));

// Passport
app.use(passport.initialize());// 패스포트 초기화
app.use(passport.session());// 패스포트 세션과 연결

// 커스텀 미들웨어
app.use(function(req, res, next) {
    // res.isAuthenticated() => passport 제공함수
    // 현재 로그인 상태인지 아닌지 판단 => true | false
    // res.locals에 담겨진 정보는 ejs에서 바로 사용가능
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});

// Routes
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts")); // 유저 글
app.use("/users", require("./routes/users"));

var port = process.env.PORT || 3000;
// Port setting
app.listen(port, function () {
    console.log("server on! http://localhost:" + port);
});
