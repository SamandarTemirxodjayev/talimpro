const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
const routes = require("./routes/router.js");

app.use(express.json());

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("Could not connect to MongoDB:", err));

app.listen(process.env.PORT || 3005, () => {
	console.log(`Server listening on port ${process.env.PORT}`);
});

app.use("/api", routes);
