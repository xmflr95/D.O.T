// model/Post.js
// models
var mongoose = require("mongoose");
var util = require("../util");
mongoose.set('useFindAndModify', false);

// schema
var postSchema = mongoose.Schema({ // 1
    header: {
        type: String
    },
    title: {
        type: String
    },
    content: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }, //2
    updatedAt: {
        type: Date
    },
}, {
    toObject: {
        virtuals: true
    } //4
});

// virtuals // 3 (가상 속성)
postSchema
    .virtual("createdDate")
    .get(function () {
        return util.getDate(this.createdAt);
    });

postSchema
    .virtual("createdTime")
    .get(function () {
        return util.getTime(this.createdAt);
    });

postSchema
    .virtual("updatedDate")
    .get(function () {
        return util.getDate(this.updatedAt);
    });

postSchema
    .virtual("updatedTime")
    .get(function () {
        return util.getTime(this.updatedAt);
    });

// model & export
var Post = mongoose.model("post", postSchema); // postSchema로 post 컬렉션 생성
module.exports = Post; // 모듈화

// 함수 (날짜 시간 포맷)
