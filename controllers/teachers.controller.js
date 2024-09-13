const ActiveTests = require("../models/ActiveTests");
const Schools = require("../models/Schools");
const Teachers = require("../models/Teachers");
const Test = require("../models/Test");
const {compare, createHash} = require("../utils/codeHash");
const {defaultDatas, randomizeTest} = require("../utils/helpers");
const {createToken} = require("../utils/token");

exports.login = async (req, res) => {
	try {
		const teacher = await Teachers.findOne({login: req.body.login});
		if (!teacher) {
			return res.status(400).json({
				status: "error",
				error: "User not found",
			});
		}

		const isPasswordValid = await compare(req.body.password, teacher.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: "error",
				error: "Invalid password",
			});
		}
		const school = await Schools.findById(teacher.school);

		const currentDate = new Date();
		if (!school.tarif || school.tarif < currentDate) {
			return res.status(400).json({
				status: "error",
				error: "Subscription expired or missing",
			});
		}

		const token = createToken(teacher._id);
		return res.status(200).json({
			status: "success",
			data: {
				token,
				teacher,
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
exports.getMe = async (req, res) => {
	try {
		const {password, ...result} = req.teacher._doc;
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
exports.updateProfile = async (req, res) => {
	try {
		const teacher = req.teacher;
		teacher.name = req.body.name;
		teacher.surname = req.body.surname;
		teacher.father_name = req.body.father_name;
		teacher.phone_number = req.body.phone_number;
		await teacher.save();
		return res.json({
			status: "success",
			data: teacher,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.resetPassword = async (req, res) => {
	try {
		const isPasswordValid = await compare(req.body.old, req.teacher.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: "error",
				error: "Invalid password",
			});
		}
		const hashedCode = await createHash(req.body.new);
		req.teacher.password = hashedCode;
		await req.teacher.save();
		const token = await createToken(req.teacher._id);
		return res.json({
			status: "success",
			data: {
				token,
				teacher: req.teacher,
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
exports.getTests = async (req, res) => {
	try {
		const tests = await Test.find(
			{
				type: "teacher",
			},
			{questions: 0},
		)
			.populate("subject")
			.populate("part")
			.populate("theme");
		return res.status(200).json({
			status: "success",
			data: tests,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
