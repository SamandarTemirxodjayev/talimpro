const Pupils = require("../models/Pupils");
const Schools = require("../models/Schools");
const {compare} = require("../utils/codeHash");
const {createToken} = require("../utils/token");

exports.login = async (req, res) => {
	try {
		const pupil = await Pupils.findOne({login: req.body.login});
		if (!pupil) {
			return res.status(400).json({
				status: "error",
				error: "User not found",
			});
		}

		const isPasswordValid = await compare(req.body.password, pupil.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: "error",
				error: "Invalid password",
			});
		}

		const school = await Schools.findById(pupil.school);

		const currentDate = Date().now;
		if (!school.tarif || school.tarif < currentDate) {
			return res.status(400).json({
				status: "error",
				error: "Subscription expired or missing",
			});
		}

		const token = createToken(pupil._id);
		return res.status(200).json({
			status: "success",
			data: {
				token,
				pupil,
			},
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getme = async (req, res) => {
	try {
		const pupil = await Pupils.findById(req.pupil._id)
			.populate("class")
			.populate("school")
			.exec();
			if (!pupil) {
				return res.status(404).json({
					status: "error",
					message: "Pupil not found",
				});
			}
	
			const { password, ...result } = pupil._doc;
			return res.json({
				data: result,
			});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};

exports.updatePupilProfile = async (req, res) => {
	try {
		const school = await Pupils.findByIdAndUpdate(req.pupil._id, req.body, {
			new: true,
		});
		return res.json({
			status: "success",
			data: school,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
