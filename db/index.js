const mongoose = require("mongoose");

const uri = "mongodb+srv://mahin:mahinelect@mahincluster.nefmmjv.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(uri)
  .then(() => {
    console.log("DB is connected!");
  })
  .catch((err) => {
    console.log("Could not connect: ", err.message);
  });
