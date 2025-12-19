const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {                                
        type: String,
        required: true
    },
});

userSchema.plugin(passportLocalMongoose);                 //username and password will be automatically defined by this.also it created many api by itself like change pass ,etc

module.exports = mongoose.model("User", userSchema);