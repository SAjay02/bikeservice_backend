const mongoose=require("mongoose");
const AddServiceSchema=mongoose.Schema({
    title:{
        type:String,
        required:false
    },
    id:{
        type:String,
        required:false
    },
    description:{
        type:String,
        required:false
    }
});
module.exports = mongoose.model("addservices", AddServiceSchema);