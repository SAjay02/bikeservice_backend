const mongoose=require("mongoose");
const RegisterSchema=mongoose.Schema({
    name:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:false
    },
    password:{
        type:String,
        required:false
    },
    phoneNumber:{
        type:String,
        required:false
    }
});
module.exports = mongoose.model("userRegister", RegisterSchema);