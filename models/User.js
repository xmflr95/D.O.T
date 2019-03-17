var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

// schema
var userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required!"],
        match: [/^.{6,12}$/, "아이디는 6~12자리 문자를 사용하셔야합니다!"],
        trim: true, // trim은 문자열 앞뒤 빈칸제거 역할.
        unique: true
    },
    name: {
        type: String,
        required: [true, "Name is required!"],
        match: [/^.{3,12}$/, "이름은 3~12자리 문자를 사용하셔야합니다!"],
        trim: true
    },
    password: {
        type: String,
        required: [true, "비밀번호를 입력해주십시오!"],
        select: false
    },
    email: {
        type: String,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Should be a vaild email address!"],
        trim: true
    }
}, {
    toObject: {
        virtuals: true
    }
});

// virtuals
userSchema.virtual("passwordConfirmation")
    .get(function () {
        return this._passwordConfirmation;
    })
    .set(function (value) {
        this._passwordConfirmation = value;
    });

userSchema.virtual("originalPassword")
    .get(function () {
        return this._originalPassword;
    })
    .set(function (value) {
        this._originalPassword = value;
    });

userSchema.virtual("currentPassword")
    .get(function () {
        return this._currentPassword;
    })
    .set(function (value) {
        this._currentPassword = value;
    });

userSchema.virtual("newPassword")
    .get(function () {
        return this._newPassword;
    })
    .set(function (value) {
        this._newPassword = value;
    });

// password validation
// match는 regex를 사용해 문자열을 검사함 /^.{8,16}$/ : 8-16자리 '.' :어떤 문자열도 허용
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
// 반복되는 에러 메시지 변수 선언
var passwordRegexErrorMessage = "비밀번호는 최소 8자리이고 알파벳과 숫자로 구성되어야합니다!";
//Should be minimum 8 characters of alphabet and number combination!";
// password validation
userSchema.path("password").validate(function (v) {
    var user = this;

    // create user
    if (user.isNew) {
        if (!user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "Password Confirmation is required!");
        }
        if (!passwordRegex.test(user.password)) {
            user.invalidate("password", passwordRegexErrorMessage);
        } else if (user.password !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }

    // update user
    if (!user.isNew) {
        if (!user.currentPassword) {
            user.invalidate("currentPassword", "Current Password is required!");
        }
        if (user.currentPassword && !bcrypt.compareSync(user.currentPassword, user.originalPassword)) {
            user.invalidate("currentPassword", "Current Password is invalid!");
        }
        if (user.newPassword && !passwordRegex.test(user.newPassword)) {
            // 정규 표현식 ? 통과시 true : 아니면 true
            // false이면 invalidate 에러 메시지 전달
            user.invalidate("newPassword", passwordRegexErrorMessage);
        } else if (user.newPassword !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }
});

// hash password
userSchema.pre("save", function (next){
  var user = this;
  if(!user.isModified("password")){
    return next();
  } else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

// model & export
var User = mongoose.model("user", userSchema);
module.exports = User;
