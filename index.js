const express = require("express");
require("dotenv").config();
const app = express();

app.use(express.json());

app.listen(process.env.PORT || 3005, () => {
	console.log(`Server listening on port ${process.env.PORT}`);
});
