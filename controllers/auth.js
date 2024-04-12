const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");

exports.createUser = async function(req, res) {
  const { email, name, password } = req.body;

  const oldUser = await UserModel.findOne({ email });
  if (oldUser)
    return res.status(403).json({ error: "The email is already in use!" });

  const user = await UserModel.create({ email, password, name });

  res.json({ success: true, user :{email,name,id:user._id.toString()}});
};

exports.signin = async function(req, res) {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found!" });

  const isMatched = await user.comparePassword(password);
  if (!isMatched) {
    return res.status(403).json({ error: "Email/Password doesn't match!" });
  }

  // user is there and password is correct
  const token = jwt.sign({ id: user._id.toString() }, "secret");

  res.json({
    success: true,
    token,
    profile: { name: user.name, role: user.role, email: user.email },
  });
};

exports.privateResponse = async function(req, res) {
  res.json({ message: "Cool man you are in the private property!" });
};

exports.adminResponse = async function(req, res) {
  res.json({ message: "Welcome boss I know you are our admin!" });
};

exports.sendProfile = function(req, res) {
  res.json({
    profile: {
      id:req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      address:req.user.address,
      orders:req.user.orders
    },
  });
};
