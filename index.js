const express = require('express');
//create a new app
const app=express();
//static PORT NO
const PORT = 8000;
const cors = require("cors");
//encrypt the data
const bcrypt = require("bcrypt")
//parser data from client
const bodyParser = require("body-parser");
//configure DB
const connectdb = require('./db');
//models
const Register = require("./RegisterModel");
const Booking = require("./BookedModel");
const AddService = require("./AddServiceModel")
const jwt = require("jsonwebtoken")
const nodeMailer = require("nodemailer")

//use  middleware
app.use(cors());
app.use(bodyParser.json());

//call the db 
connectdb();


//send service endpoint
app.post("/addservices",async(req,res)=>
{
    try
    {
        const newService = await new AddService(req.body);
        await newService.save();
        res.status(200).json({newService});
    }
    catch(error)
    {
        console.log("Error: "+error);
        res.status(500).json("Error");
    }
})

//edit service endpoint
app.post("/editservices",async(req,res)=>
{
    const {title,id,description} = req.body;

    try
    {
            const findService = await AddService.findOne({title});
            if(findService)
            {
                const editService = await AddService.findOneAndUpdate(
                    {_id:findService._id},
                    {
                        $set:
                        {
                            title:title,
                            id:id,
                            description:description
                        }
                    },
                )
                await editService.save();
                res.status(200).json({editService});
            }
    }
    catch(error)
    {
        console.log("Error: "+error);
        res.status(500).json("Error");
    }
})


//delete service endpoint
app.delete("/deleteservice/:title",async(req,res)=>
{
    //get the selected service 
    const {title} = req.params;
    try
    {
        const findService = await AddService.findOne({title});
        if(findService)
        {
            await AddService.deleteOne({title});
            res.status(200).json({findService});
        }
    }
    catch(error)
    {
        console.log("Error: "+error);
        res.status(500).json({error:"Not Found"})
    }
})

//get allservice endpoint
app.get("/getservices",async(req,res)=>
{
    const getService = await AddService.find({});
    res.status(200).json({getService});
})

//send the data of user form client to DB endpoint
app.post("/userRegister",async(req,res)=>
{
    try
    {
        const {name,email,password,phoneNumber} = req.body;
        //check the user already exist
        const existUser = await Register.findOne({email})
        if(existUser)
        {
            return res.status(500).send({error:"User already exist"});
        }
        else
        {
            //encode the user password
            const hashPassword = await bcrypt.hash(password,10);

            //create a new user
            const newRegister = await Register.create(
                {
                    name,
                    email,
                    password:String(hashPassword),
                    phoneNumber
                }
            )

            // const newRegister = await new Register(req.body);
            await newRegister.save();
            res.status(201).json(newRegister); 
        }
    }
    catch(error)
    {
        console.log("Error: "+error);
        res.status(500).json({error:"Server Error"});
    }
})

//get the login of the user endpoint
app.post("/userlogin",async(req,res)=>
{
    const adminName = "Ajay";
    const adminEmail = "ajay02@gmail.com";
    const adminPassword = "Ajay02";
    try
    {
        const {email,password} = req.body;
        
        //check for admin login
        if(email==adminEmail && password==adminPassword)
        {
            const token = jwt.sign(
                {
                    adminName,adminEmail,role:"admin"
                },
                "bikeservice",
                {
                    expiresIn:"20d"
                }
            )

            res.status(200).json({token,user:{email,role:"admin"}});
        }
        else
        {

            //check for admin login
            const userExist = await Register.findOne({email});

            if(userExist &&(await bcrypt.compare(password,userExist.password)))
            {
                const token = jwt.sign(
                    {
                        id:userExist.id_,email,name:userExist.name
                    },
                    "bikeservice",
                    {
                        expiresIn:"20d"
                    }
                )
                
                //set the expire date for token
                const options={
                    expires:new Date(Date.now()+20 * 24 * 60 * 60 * 1000),
                    httpOnly:true
                };

                res.status(200).cookie("token",token,options).json({token,user:{userExist,role:"user"}});
            }
            else
            return res.status(400).json({error:"invalid user"})
        }
    }
    catch(error)
    {
        res.status(500).json({error:"Server error"})
    }
})

//send the serice the of the user endpoint
app.post('/bookservice',async(req,res)=>
{
    const {name,date,email,status,id,title,Delivery} = req.body;
    try
    {
            //create a new booking
            const booking = await Booking.findOneAndUpdate(
                {authToken : email},
                {
                    $push:
                    {
                        bookedDetails:
                        {
                            name,date,status,id,title,Delivery
                        }
                    }
                },
                
                //create a new instances of booking if not laready
                { new: true, upsert: true }
            )
        res.status(200).json({booking});
    }
    catch(error)
    {
        console.log("Error: "+error);
        res.status(500).json({error:"Server Error"});
    }
}) 

//get the bookings of the user endpoint
app.get("/getBookings/:authToken",async(req,res)=>
{
    //get the data from parameter
    const {authToken} = req.params;
    // console.log(email);
    try
    {
        //find the data to fetch
        const checkEmail = await Booking.findOne({authToken});
        // console.log(checkEmail)
        if(checkEmail)
        {
            res.status(200).json({checkEmail});
        }
        else
        {
            res.status(400).json({error:"Email not found"});
        }
    }
    catch(error)
    {
        console.log("Error: "+error);
    }
})


//send confirmation mail to the user endpoint
app.post('/sendemail',async(req,res)=>
    {
        //get the data from parameter
      const  {email,userName,title,name} = req.body;
      console.log(email)

      //create a details to sender
        var sender = nodeMailer.createTransport({
          service:'gmail',
          auth:{
            user : '56510.ajay@gmail.com',
            pass : 'czwe rjqj wxfi suqf'
          }
        });

        //create a details for receiver
        var composemail = {
          from : '56510.ajay@gmail.com',
          to: email,
          subject : `Service Confirmed`,
          text:`Hello ${userName},

        Your service booking has been confirmed. We will send you an update when your bike gets ready.
        Here is your details:
        Service: ${title}
        Model Name: ${name}
        Thank you for choosing our service!

        Best regards,
        HogTech Service Team`
        }

        sender.sendMail(composemail,function(error,info)
        {
          if(error)
          {
            console.log(error);
          }
          else
          {
            console.log("Mail Done :"+info.response)
            res.status(200).json("Mail Sent Succesfully")
          }
        })
    })


//send confirmation mail to the user endpoint
app.post('/completedemail/:email',async(req,res)=>
    {
    //get the data from parameter
      const  {email} = req.params;
      //create a details to sender
        var sender = nodeMailer.createTransport({
          service:'gmail',
          auth:{
            user : '56510.ajay@gmail.com',
            pass : 'czwe rjqj wxfi suqf'
          }
        });

        //create a details for receiver
        var composemail = {
          from : '56510.ajay@gmail.com',
          to: email,
          subject : `Service Confirmed`,
          text:`Hello User,

        Your Bike was completely ready. So take it your place as soon as possible.

        Thank you for choosing our service!

        Best regards,
        HogTech Service Team`
        }

        sender.sendMail(composemail,function(error,info)
        {
          if(error)
          {
            console.log(error);
          }
          else
          {
            console.log("Mail Done :"+info.response)
            res.status(200).json("Mail Sent Succesfully")
          }
        })
    })


//get the all booked details to admin dashboard endpoint
app.get('/getUserDetails',async(req,res)=>
{
    const allRegister = await Register.find();
    res.status(200).json({allRegister});
})

//update the details of the user if service has ready endpoint
app.post('/updateService/:authToken/:userDetails',async(req,res)=>
{
    //get the data from parameter
    const {authToken,userDetails} = req.params;
    const userData= userDetails.split(",");
    const name = userData[0];
    const date = userData[1];
    const status = "Not Completed";
    const Delivery = "Ready"
    const id = userData[3];
    const title = userData[4];

    try
    {
        const findUser = await Booking.findOne({authToken});
        if(findUser)
        {
            const updateService = await Booking.findOneAndUpdate(
                {authToken:authToken,"bookedDetails.name":name},
                {
                    $set:
                    {
                        "bookedDetails.$.name": name,
                        "bookedDetails.$.date": date,
                        "bookedDetails.$.status": status,
                        "bookedDetails.$.id": id,
                        "bookedDetails.$.title": title,
                        "bookedDetails.$.Delivery": Delivery,
                    }
                },
            )
            res.status(200).json({updateService});
        }
        // else
        // {
        //     res.status(400).json({Error:"User not found"})
        // }
    }
    catch(error)
    {
        console.log("Error: "+error);
        res.status(500).json({error});
    }
})

//update the details of the user if service has done endpoint
app.post('/updateServiceComplete/:authToken/:userDetails',async(req,res)=>
    {
        //get the data from parameter
        const {authToken,userDetails} = req.params;
        const userData= userDetails.split(",");
        const name = userData[0];
        const date = userData[1];
        const status = "Completed";
        const Delivery = "Ready"
        const id = userData[3];
        const title = userData[4];
    
        try
        {
            const findUser = await Booking.findOne({authToken});
            if(findUser)
            {
                const updateService = await Booking.findOneAndUpdate(
                    {authToken:authToken,"bookedDetails.name":name},
                    {
                        $set:
                        {
                            "bookedDetails.$.name": name,
                            "bookedDetails.$.date": date,
                            "bookedDetails.$.status": status,
                            "bookedDetails.$.id": id,
                            "bookedDetails.$.title": title,
                            "bookedDetails.$.Delivery": Delivery,
                        }
                    },
                )
                res.status(200).json({updateService});
            }
            else
            {
                res.status(400).json({Error:"User not found"})
            }
        }
        catch(error)
        {
            console.log("Error: "+error);
            res.status(500).json({error});
        }
})

app.listen(PORT,()=>
{
    console.log("Server is Running");
})
