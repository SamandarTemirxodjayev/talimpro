const {default: mongoose} = require("mongoose");
const ActiveTests = require("../models/ActiveTests");
const Schools = require("../models/Schools");
const Teachers = require("../models/Teachers");
const Test = require("../models/Test");
const {compare} = require("../utils/codeHash");
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
		const {password, ...result} = req.teacher._doc
		return res.json({
			data: result
		})
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
}
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
exports.getTestById = async (req, res) => {
	try {
		const {id} = req.params;

		let query = {};
		if (mongoose.Types.ObjectId.isValid(id)) {
			query = {_id: id};
		} else if (!isNaN(id)) {
			query = {test_id: id};
		} else {
			return res.status(400).json({
				status: "fail",
				message: "Invalid ID format",
			});
		}

		const test = await Test.findOne(query, {questions: 0})
			.populate("subject")
			.populate("part")
			.populate("theme");

		if (!test) {
			return res.status(404).json({
				status: "fail",
				message: "Test not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: test,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.startTest = async (req, res) => {
	try {
		const test1 = await randomizeTest(req.params.id);
		const data = await defaultDatas("./database/default.json");
		const test2 = await randomizeTest(data.teacher_test_id);
		const newActiveTest = await ActiveTests.create({
			teacher: req.teacher._id,
			main_test_id: new mongoose.Types.ObjectId(req.params.id),
			secondary_test_id: new mongoose.Types.ObjectId(data.teacher_test_id),
			main_test: test1,
			secondary_test: test2,
		});
		await newActiveTest.save();
		return res.json({
			status: "success",
			data: {
				main_test_id: new mongoose.Types.ObjectId(req.params.id),
				secondary_test_id: new mongoose.Types.ObjectId(data.teacher_test_id),
				main_test: test1,
				secondary_test: test2,
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
exports.getActiveTests = async (req, res) => {
	try {
		const activeTest = await ActiveTests.find(
			{
				teacher: req.teacher._id,
			},
			{main_test: 0, secondary_test: 0},
		);
		return res.json({
			status: "success",
			data: activeTest,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
