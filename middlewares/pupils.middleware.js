const jwt = require("jsonwebtoken");
const Pupils = require("../models/Pupils");

async function PupilMiddleware(req, res, next) {
	const authorizationHeader = req.headers.authorization;
	if (!authorizationHeader) {
		return res
			.status(401)

			.set({
				"Content-Type": "application/json",
				"WWW-Authenticate": 'Bearer realm="api"',
			})
			.json({
				error: "Not Authorized!",
				message: "Missing authorization header",
			});
	}

	const accessToken = authorizationHeader.split(" ")[1];
	if (!accessToken) {
		return res
			.status(401)
			.json({error: "Not Authorized!", message: "Invalid access token"});
	}

	try {
		const decoded = jwt.verify(accessToken, "Samandar0321@02212006H193OC");
		const pupil = await Pupils.findById(decoded).populate("class");
		if (!pupil) {
			return res
				.status(401)
				.json({error: "Not Authorized!", message: "Invalid access token"});
		}
		req.pupil = pupil;
		return next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return res
				.status(401)
				.json({error: "Not Authorized!", message: "Invalid access token"});
		}
		return res
			.status(500)
			.json({error: "Internal Server Error", message: "An error occurred"});
	}
}

module.exports = PupilMiddleware;
