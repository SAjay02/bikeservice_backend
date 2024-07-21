const mongoose=require("mongoose");
const BookedSchema=mongoose.Schema({
    authToken:{
        type:String,
        required:false
    },
    bookedDetails:[
        {
            name:{
                type:String,
                required:false
            },
            date:{
                type:String,
                required:false
            },
            status:{
                type:String,
                required:false
            },
            id:{
                type:String,
                required:false
            },
            title:{
                type:String,
                required:false
            },
            Delivery:{
                type:String,
                required:false
            }
        }
    ]
});
module.exports = mongoose.model("userBooking", BookedSchema);