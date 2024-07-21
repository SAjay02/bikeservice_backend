const mongoose=require("mongoose");
const connectdb=async()=>
{
    try {
    const connection = await mongoose.connect("mongodb+srv://Ajay:AJAY2004@cluster0.rbciovk.mongodb.net/bikeservice", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database connected:", connection.connection.host, connection.connection.name);
    return connection;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
module.exports=connectdb;