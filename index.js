const express = require("express");
require("./db/index.js");
const authRouter = require("./routes/auth.js");
const cors = require("cors");
const UserModel = require("./models/user.js");

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.json({ shop:"mahinelectrical" });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});

// Endpoint to store a new address
app.post("/addaddress",async(req,res)=>{
  console.log("adding address");
  try {
    const {userId,address} = req.body;
    // find user by the userId
    const user = await UserModel.findById(userId);
    if(!user){
      res.status(404).json({message:"User Not Found"})
    }
    // add new address to users address array
    user.address.push(address);
    user.save();
    res.status(200).json({message:"address added successfully"});
  } catch (error) {
    res.status(500).json({message:"Error Adding Address"})
  }
})

//Endpoint to get all addresses of the user
app.get("/addresses/:userId",()=>{
  try {
    const userId = req.params.userId;
    const user = UserModel.findById(userId);
    if(!user){
      res.status(404).json({message:"User Not Found"})
    }
    const addresses = user.address;
    res.status(200).json({message:"ok",addresses:addresses})
  } catch (error) {
    res.status(500).json({message:"Error getting User Addresses"})
  }
})