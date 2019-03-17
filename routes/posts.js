// routes/posts.js
var express = require("express");
var router = express.Router();
var Post = require("../models/Post"); // 만든 모듈
var util = require("../util");

// Index
router.get("/", (req, res) => {
    Post.find({}) // 1
        .populate("author")
        .sort("-createdAt") // 1 :오름차순 / -1 :내림차순
        .exec(function (err, posts) { // 프로미스 쿼리
            // db를 어떻게 찾을 것인가, .sort로 정렬
            // exec안의 함수에서 해당 data를 받아와서 할일 정함.
            if (err) return res.json(err);
            res.render("posts/index", {
                posts: posts
            });
        });
});

// New
router.get("/new", util.isLoggedin, (req, res) => {
    var post = req.flash("post")[0] || {};
    var errors = req.flash("errors")[0] || {};
    res.render("posts/post_modal");
});

// create
router.post("/", util.isLoggedin, function (req, res) {
    req.body.author = req.user._id;
    Post.create(req.body, function (err, post) {
        if (err) {
            req.flash("post", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/posts/new");
        }
        res.redirect("/posts");
    });
});

// show
router.get("/:id", function(req, res){
  Post.findOne({_id:req.params.id})
  .populate("author")
  .exec(function(err, post){
    if(err) return res.json(err);
    res.render("posts/show", {post:post});
  });
});

// edit
router.get("/:id/edit", util.isLoggedin, checkPermission, function(req, res){
  var post = req.flash("post")[0];
  var errors = req.flash("errors")[0] || {};
  if(!post){
    Post.findOne({_id:req.params.id}, function(err, post){
      if(err) return res.json(err);
      res.render("posts/edit", { post:post, errors:errors });
    });
  } else {
    post._id = req.params.id;
    res.render("posts/edit", { post:post, errors:errors });
  }
});

// update
router.put("/:id", util.isLoggedin, checkPermission, function(req, res){
  req.body.updatedAt = Date.now();
  Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){
    if(err){
      req.flash("post", req.body);
      req.flash("errors", util.parseError(err));
      return res.redirect("/posts/"+req.params.id+"/edit");
    }
    res.redirect("/posts/"+req.params.id);
  });
});

// destroy (삭제)
router.delete("/:id", util.isLoggedin, checkPermission, function (req, res) {
    Post.remove({
        _id: req.params.id
    }, (err) => {
        if (err) return res.json(err);
        res.redirect("/posts");
    });
});

//모듈화
module.exports = router;

// private functions
function checkPermission(req, res, next) {
    Post.findOne({
        _id: req.params.id
    }, function (err, post) {
        if (err) return res.json(err);
        if (post.author != req.user.id) return util.noPermission(req, res);

        next();
    });
}
