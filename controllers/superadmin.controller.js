const Parts = require("../models/Parts");
const Pupils = require("../models/Pupils");
const Schools = require("../models/Schools");
const Subjects = require("../models/Subjects");
const Superadmins = require("../models/Superadmins");
const Teachers = require("../models/Teachers");
const Test = require("../models/Test");
const Themes = require("../models/Themes");
const {createHash, compare} = require("../utils/codeHash");
const {createToken} = require("../utils/token");
const mongoose = require("mongoose");
const fs = require("fs");

exports.createAdmin = async (req, res) => {
	try {
		let hashedCode = await createHash(req.body.password.toString());
		const admin = await Superadmins.create({
			name: req.body.name,
			surname: req.body.surname,
			login: req.body.login,
			password: hashedCode,
		});
		await admin.save();
		return res.json({
			message: "success",
			status: "success",
			data: admin,
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.login = async (req, res) => {
	try {
		const admin = await Superadmins.findOne({
			login: req.body.login,
		});
		if (!admin) {
			return res.status(400).json({
				message: "Login Xato",
				status: "error",
				data: [],
			});
		}
		const comparePassword = await compare(req.body.password, admin.password);

		if (!comparePassword) {
			return res.status(400).json({
				message: "Parol Xato",
				status: "error",
				data: [],
			});
		}
		const token = createToken(admin._id);
		return res.json({
			message: "Confirmed",
			status: "success",
			data: {
				auth_token: token,
				token_type: "bearer",
				createdAt: new Date(),
				expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			},
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.createSchool = async (req, res) => {
	try {
		const newSchool = await Schools.create(req.body);
		newSchool.login = `s${newSchool.school_id}`;
		const hashedCode = await createHash(`s${newSchool.school_id}`);
		newSchool.password = hashedCode;
		await newSchool.save();
		return res.status(200).json({
			status: "success",
			data: newSchool,
		});
	} catch (error) {
		console.error("Error creating school:", error);
		return res.status(500).json({message: error.message});
	}
};
exports.getSchools = async (req, res) => {
	try {
		const schools = await Schools.find();
		return res.status(200).json({
			status: "success",
			data: schools,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({message: error});
	}
};
exports.getSchoolsByRegions = async (req, res) => {
	try {
		const schools = await Schools.find({
			region: req.body.region,
		});
		return res.status(200).json({
			status: "success",
			data: schools,
		});
	} catch (error) {
		console.error("Error fetching school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getSchoolsById = async (req, res) => {
	try {
		const {id} = req.params;

		let query = {};
		if (mongoose.Types.ObjectId.isValid(id)) {
			query = {_id: id};
		} else if (!isNaN(id)) {
			query = {school_id: id};
		} else {
			return res.status(400).json({
				status: "fail",
				message: "Invalid ID format",
			});
		}

		const school = await Schools.findOne(query);

		if (!school) {
			return res.status(404).json({
				status: "fail",
				message: "School not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: school,
		});
	} catch (error) {
		console.error("Error fetching school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.deleteSchool = async (req, res) => {
	try {
		const {id} = req.params;

		let query = {};
		if (mongoose.Types.ObjectId.isValid(id)) {
			query = {_id: id};
		} else if (!isNaN(id)) {
			query = {school_id: id};
		} else {
			return res.status(400).json({
				status: "fail",
				message: "Invalid ID format",
			});
		}

		const school = await Schools.findOneAndDelete(query);

		if (!school) {
			return res.status(404).json({
				status: "fail",
				message: "School not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: school,
		});
	} catch (error) {
		console.error("Error fetching school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.updateSchool = async (req, res) => {
	try {
		const {id} = req.params;
		const {password, ...updateData} = req.body;

		let query = {};
		if (mongoose.Types.ObjectId.isValid(id)) {
			query = {_id: id};
		} else if (!isNaN(id)) {
			query = {school_id: id};
		} else {
			return res.status(400).json({
				status: "fail",
				message: "Invalid ID format",
			});
		}

		if (password) {
			const hashedPassword = await createHash(password, 10);
			updateData.password = hashedPassword;
		}

		const school = await Schools.findOneAndUpdate(query, updateData, {
			new: true,
		});

		if (!school) {
			return res.status(404).json({
				status: "fail",
				message: "School not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: school,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.giveSchoolPermission = async (req, res) => {
	try {
		const school = await Schools.findById(req.params.id);
		school.tarif = new Date(req.body.tarif);
		await school.save();
		return res.status(200).json({
			status: "success",
			data: school,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getAllTeachers = async (req, res) => {
	try {
		const teachers = await Teachers.find().populate("school");
		return res.status(200).json({
			status: "success",
			data: teachers,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getAllPupils = async (req, res) => {
	try {
		const pupils = await Pupils.find().populate("school").populate("class");
		return res.status(200).json({
			status: "success",
			data: pupils,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.createTest = async (req, res) => {
	try {
		const test = await Test.create(req.body);
		await test.save();
		return res.status(200).json({
			status: "success",
			data: test,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.createSubject = async (req, res) => {
	try {
		const subject = await Subjects.create(req.body);
		await subject.save();
		return res.status(200).json({
			status: "success",
			data: subject,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getAllSubjects = async (req, res) => {
	try {
		const subjects = await Subjects.find();
		return res.status(200).json({
			status: "success",
			data: subjects,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getSubjectById = async (req, res) => {
	try {
		const {id} = req.params;

		let query = {};
		if (mongoose.Types.ObjectId.isValid(id)) {
			query = {_id: id};
		} else if (!isNaN(id)) {
			query = {subject_id: id};
		} else {
			return res.status(400).json({
				status: "fail",
				message: "Invalid ID format",
			});
		}

		const subject = await Subjects.findOne(query);

		if (!subject) {
			return res.status(404).json({
				status: "fail",
				message: "subject not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: subject,
		});
	} catch (error) {
		console.error("Error updating subject by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.updateSubjectById = async (req, res) => {
	try {
		const subject = await Subjects.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!subject) {
			return res.status(500).json({
				status: "error",
				message: "Subject does not exist",
				error: null,
			});
		}
		return res.status(200).json({
			status: "success",
			data: subject,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.deleteSubjectById = async (req, res) => {
	try {
		const subject = await Subjects.findByIdAndDelete(req.params.id);
		if (!subject) {
			return res.status(500).json({
				status: "error",
				message: "Subject does not exist",
				error: null,
			});
		}
		return res.status(200).json({
			status: "success",
			data: subject,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.createPart = async (req, res) => {
	try {
		const part = await Parts.create(req.body);
		await part.save();
		return res.status(200).json({
			status: "success",
			data: part,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getAllParts = async (req, res) => {
	try {
		const parts = await Parts.find().populate("subject");
		return res.status(200).json({
			status: "success",
			data: parts,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getPartById = async (req, res) => {
	try {
		const {id} = req.params;

		let query = {};
		if (mongoose.Types.ObjectId.isValid(id)) {
			query = {_id: id};
		} else if (!isNaN(id)) {
			query = {part_id: id};
		} else {
			return res.status(400).json({
				status: "fail",
				message: "Invalid ID format",
			});
		}

		const part = await Parts.findOne(query);

		if (!part) {
			return res.status(404).json({
				status: "fail",
				message: "part not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: part,
		});
	} catch (error) {
		console.error("Error updating subject by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getPartsBySubjectId = async (req, res) => {
	try {
		const parts = await Parts.find({
			subject: new mongoose.Types.ObjectId(req.params.id),
		}).populate("subject");
		return res.status(200).json({
			status: "success",
			data: parts,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.updatePartById = async (req, res) => {
	try {
		const part = await Parts.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!part) {
			return res.status(500).json({
				status: "error",
				message: "Part does not exist",
				error: null,
			});
		}
		return res.status(200).json({
			status: "success",
			data: part,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.deletePartById = async (req, res) => {
	try {
		const part = await Parts.findByIdAndDelete(req.params.id);
		if (!part) {
			return res.status(500).json({
				status: "error",
				message: "Subject does not exist",
				error: null,
			});
		}
		return res.status(200).json({
			status: "success",
			data: part,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.createTheme = async (req, res) => {
	try {
		const theme = await Themes.create(req.body);
		await theme.save();
		return res.status(200).json({
			status: "success",
			data: theme,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getAllThemes = async (req, res) => {
	try {
		const themes = await Themes.find()
			.populate("part")
			.populate({
				path: "part",
				populate: [{path: "subject"}],
			});
		return res.status(200).json({
			status: "success",
			data: themes,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getThemeById = async (req, res) => {
	try {
		const {id} = req.params;

		let query = {};
		if (mongoose.Types.ObjectId.isValid(id)) {
			query = {_id: id};
		} else if (!isNaN(id)) {
			query = {theme_id: id};
		} else {
			return res.status(400).json({
				status: "fail",
				message: "Invalid ID format",
			});
		}

		const theme = await Themes.findOne(query);

		if (!theme) {
			return res.status(404).json({
				status: "fail",
				message: "theme not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: theme,
		});
	} catch (error) {
		console.error("Error updating subject by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getThemesByPartId = async (req, res) => {
	try {
		const themes = await Themes.find({
			part: new mongoose.Types.ObjectId(req.params.id),
		})
			.populate("part")
			.populate({
				path: "part",
				populate: [{path: "subject"}],
			});
		return res.status(200).json({
			status: "success",
			data: themes,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.updateThemeById = async (req, res) => {
	try {
		const theme = await Themes.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!theme) {
			return res.status(500).json({
				status: "error",
				message: "theme does not exist",
				error: null,
			});
		}
		return res.status(200).json({
			status: "success",
			data: theme,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.deleteThemeById = async (req, res) => {
	try {
		const theme = await Themes.findByIdAndDelete(req.params.id);
		if (!theme) {
			return res.status(500).json({
				status: "error",
				message: "Subject does not exist",
				error: null,
			});
		}
		return res.status(200).json({
			status: "success",
			data: theme,
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.setDefaultDatas = async (req, res) => {
	try {
		const default_datas = req.body;
		fs.writeFile(
			"./database/default.json",
			JSON.stringify(default_datas, null, 2),
			(writeErr) => {
				if (writeErr) {
					console.error(writeErr);
					return res.status(500).json({error: "Failed to write file"});
				}

				return res.json({
					data: default_datas,
					status: "success",
				});
			},
		);
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getDefaultDatas = async (req, res) => {
	try {
		fs.readFile("./database/default.json", "utf8", (err, data) => {
			if (err) {
				console.error(err);
				return res.status(500).json({error: "Failed to read file"});
			}
			const file = JSON.parse(data);
			return res.json({
				data: file,
				status: "success",
			});
		});
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
