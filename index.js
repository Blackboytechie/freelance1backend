const express = require("express");
require("./db/index.js");
const authRouter = require("./routes/auth.js");
const cors = require("cors");
const User = require("./models/user.js");

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
  try {
    const {userId,address} = req.body;
    // find user by the userId
    const user = await User.findById(userId);
    if(!user){
      res.status(404).json({message:"User Not Found"})
    }
    // add new address to users address array
    User.address.push(address);
    User.bulkSave();
  } catch (error) {
    res.status(500).json({message:"Error Adding Address"})
  }
})