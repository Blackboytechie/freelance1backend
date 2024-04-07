const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { hash, compare, genSalt } = require("bcryptjs");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    address:[{
      name:String,
      mobileNo:String,
      houseNo:String,
      street:String,
      landmark:String,
      city:String,
      country:String,
      postalCode:String
    }],
    orders:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"order"
    }],
    createdAt:{
      type:Date,
      default:Date.now
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
  return await compare(password, this.password);
};

const UserModel = model("User", userSchema);

module.exports = UserModel;
