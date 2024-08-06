const {default: mongoose} = require("mongoose");
const Schools = require("../models/Schools");
const Teachers = require("../models/Teachers");
const {compare, createHash} = require("../utils/codeHash");
const {createToken} = require("../utils/token");
const Classes = require("../models/Classes");
const Pupils = require("../models/Pupils");

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

		const currentDate = new Date();
		if (!school.tarif || school.tarif < currentDate) {
			return res.status(400).json({
				status: "error",
				error: "Subscription expired or missing",
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
exports.createClass = async (req, res) => {
	try {
		const newClass = await Classes.create({
			school: req.school._id,
			number: req.body.number,
			letter: req.body.letter,
		});
		await newClass.save();
		return res.json({
			status: "success",
			data: newClass,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getClasses = async (req, res) => {
	try {
		const classes = await Classes.find({
			school: req.school._id,
		}).populate("school");
		return res.json({
			status: "success",
			data: classes,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getClassById = async (req, res) => {
	try {
		const {id} = req.params;

		let query = {};
		if (mongoose.Types.ObjectId.isValid(id)) {
			query = {_id: id, school: req.school._id};
		} else if (!isNaN(id)) {
			query = {class_id: id, school: req.school._id};
		} else {
			return res.status(400).json({
				status: "fail",
				message: "Invalid ID format",
			});
		}

		const Class = await Classes.findOne(query).populate("school");

		if (!Class) {
			return res.status(404).json({
				status: "fail",
				message: "Class not found",
			});
		}
		return res.json({
			status: "success",
			data: Class,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.deleteClass = async (req, res) => {
	try {
		await Classes.findByIdAndDelete(req.params.id);
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
exports.updateClass = async (req, res) => {
	try {
		const Class = await Classes.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		return res.status(200).json({
			status: "success",
			data: Class,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.createPupil = async (req, res) => {
	try {
		const Class = await Classes.findOne({
			_id: req.body.class,
			school: req.school._id,
		});
		if (!Class) {
			return res.status(400).json({
				message: "Class not found",
				data: null,
			});
		}
		const pupil = await Pupils.create(req.body);
		pupil.school = req.school._id;
		pupil.class = Class._id;
		pupil.login = `p${pupil.pupil_id}`;
		const hashedCode = await createHash(`p${pupil.pupil_id}`);
		pupil.password = hashedCode;
		await pupil.save();
		return res.status(200).json({
			status: "success",
			data: pupil,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getPupils = async (req, res) => {
	try {
		const pupils = await Pupils.find({
			class: req.params.id,
			school: req.school._id,
		})
			.populate("school")
			.populate("class");
		return res.status(200).json({
			status: "success",
			data: pupils,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.deletePupil = async (req, res) => {
	try {
		await Pupils.findByIdAndDelete(req.params.id);
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
exports.updatePupil = async (req, res) => {
	try {
		const pupil = await Pupils.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!pupil) {
			return res.status(400).json({
				message: "Pupil not found",
				data: null,
			});
		}
		return res.status(200).json({
			status: "success",
			data: pupil,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.updatePupilPassword = async (req, res) => {
	try {
		const hashedCode = await createHash(req.body.password);
		const pupil = await Pupils.findById(req.params.id);
		pupil.password = hashedCode;
		await pupil.save();
		return res.json({
			status: "success",
			data: {
				school: pupil,
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
