const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { JsonWebTokenError } = require("jsonwebtoken");
const UserModel = require("../models/user");
const {
  adminResponse,
  createUser,
  privateResponse,
  sendProfile,
  signin,
} = require("../controllers/auth");
const { newUserValidator } = require("../middleware/validator");

const authRouter = Router();

const isAuth = async (req, res, next) => {
  try {
    const authorizationToken = req.headers.authorization;
    console.log("auth_token_server:",authorizationToken);
    const token = authorizationToken?.split("Bearer ")[1];
    if (!token) return res.status(403).json({ error: "unauthorized access!" });

    const payload = jwt.verify(token, "secret");

    const user = await UserModel.findById(payload.id);
    if (!user) return res.status(403).json({ error: "unauthorized access!" });

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      res.status(403).json({ error: "unauthorized access!" });
    } else {
      res.status(500).json({ error: "Something went wrong!" });
    }
  }
};

const isAdmin = async (req, res, next) => {
  if (req.user.role === "admin") next();
  else res.status(403).json({ error: "Protected only for admin!" });
};

authRouter.post("/signup", newUserValidator, createUser);
authRouter.post("/signin", newUserValidator, signin);
authRouter.get("/profile", isAuth, sendProfile);
authRouter.get("/private", isAuth, privateResponse);
authRouter.get("/admin", isAuth, isAdmin, adminResponse);

module.exports = authRouter;
