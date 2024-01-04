const mongoose= require("mongoose")
const passport = require("passport")

const plm =require("passport-local-mongoose")

const usermodel= mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true,"Username is required!"]
    },
    email: {
        type: String,
        required: [true,"Email is required!"],
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill valid email id"]
    },
    password: {
        type: String,
        // required: [true,"Password is required!"],
        // minLength: [4, "Password field must have atleast 4 characters"],
        // maxLength: [15, "Password fiels must have atmost 15 characters"]
    },
    resetPasswordOtp: {
      type: Number,
      default: -1
    },
    posts:[{type: mongoose.Schema.Types.ObjectId, ref: "post"}]
})

usermodel.plugin(plm)


module.exports=mongoose.model("collection4",usermodel)