const {default: mongoose} = require("mongoose");
const Schools = require("../models/Schools");
const Teachers = require("../models/Teachers");
const {compare, createHash} = require("../utils/codeHash");
const {createToken} = require("../utils/token");

exports.login = async (req, res) => {
	try {
		const school = await Schools.findOne({login: req.body.login});
		if (!school) {
			return res.status(400).json({
				status: "error",
				error: "User not found",
			});
		}

		const isPasswordValid = await compare(req.body.password, school.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: "error",
				error: "Invalid password",
			});
		}

		const token = createToken(school._id);
		return res.status(200).json({
			status: "success",
			data: {
				token,
				school,
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
exports.resetPassword = async (req, res) => {
	try {
		const isPasswordValid = await compare(req.body.old, req.school.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: "error",
				error: "Invalid password",
			});
		}
		const hashedCode = await createHash(req.body.new);
		req.school.password = hashedCode;
		await req.school.save();
		const token = await createToken(req.school._id);
		return res.json({
			status: "success",
			data: {
				token,
				school: req.school,
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
exports.updateTeacherPassword = async (req, res) => {
	try {
		const hashedCode = await createHash(req.body.password);
		const teacher = await Teachers.findById(req.params.id);
		teacher.password = hashedCode;
		await teacher.save();
		return res.json({
			status: "success",
			data: {
				school: teacher,
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
exports.createTeacher = async (req, res) => {
	try {
		const teacher = await Teachers.create(req.body);
		teacher.school = req.school._id;
		teacher.login = `t${teacher.teacher_id}`;
		const hashedCode = await createHash(`t${teacher.teacher_id}`);
		teacher.password = hashedCode;
		await teacher.save();
		return res.status(200).json({
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
exports.getTeachers = async (req, res) => {
	try {
		const teachers = await Teachers.find({
			school: req.school._id,
		});
		return res.status(200).json({
			status: "success",
			data: teachers,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getTeacherById = async (req, res) => {
	try {
		const {id} = req.params;

		let query = {};
		if (mongoose.Types.ObjectId.isValid(id)) {
			query = {_id: id};
		} else if (!isNaN(id)) {
			query = {teacher_id: id};
		} else {
			return res.status(400).json({
				status: "fail",
				message: "Invalid ID format",
			});
		}

		const teacher = await Teachers.findOne(query);

		if (!teacher) {
			return res.status(404).json({
				status: "fail",
				message: "Teacher not found",
			});
		}

		return res.status(200).json({
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
exports.deleteTeacher = async (req, res) => {
	try {
		await Teachers.findByIdAndDelete(req.params.id);
		return res.status(200).json({
			status: "success",
			data: null,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.updateTeacher = async (req, res) => {
	try {
		const teacher = await Teachers.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		return res.status(200).json({
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
