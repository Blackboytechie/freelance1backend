const express = require("express");
require("./db/index.js");
const authRouter = require("./routes/auth.js");
const cors = require("cors");

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});
