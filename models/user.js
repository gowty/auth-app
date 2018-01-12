var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


var UserSchema = mongoose.Schema({
    users_id: {
       type: String,
     },
     role: {
        type: String,
      },
    username: {
       type: String,
       index: true
     },
     firstname: {
       type: String
     },
     lastname: {
       type: String
     },
     email: {
       type: String
     },
     password: {
       type: String
     },
     password2: {
       type: String
     },
     timeStamp: {
       type: String
     }
});

UserSchema.plugin(passportLocalMongoose);

var User = module.exports = mongoose.model("User", UserSchema);
