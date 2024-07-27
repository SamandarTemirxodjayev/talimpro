const jwt = require("jsonwebtoken");

exports.createToken = (user) => {
	try {
		return jwt.sign(
			{
				_id: user,
			},
			"Samandar0321@02212006H193OC",
			{expiresIn: "30d"},
		);
	} catch (error) {
		console.error("Error creating token:", error);
		return null;
	}
};