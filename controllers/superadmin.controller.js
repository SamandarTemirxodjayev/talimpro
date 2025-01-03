const Parts = require("../models/Parts");
const Pupils = require("../models/Pupils");
const Schools = require("../models/Schools");
const Subjects = require("../models/Subjects");
const Superadmins = require("../models/Superadmins");
const Teachers = require("../models/Teachers");
const Themes = require("../models/Themes");
const {createHash, compare} = require("../utils/codeHash");
const {createToken, generateHashedToken} = require("../utils/token");
const mongoose = require("mongoose");
const fs = require("fs");
const TestTypes = require("../models/TestTypes");
const Universities = require("../models/Universities");
const {paginate} = require("../utils/helpers");
const multer = require("multer");
const ActiveTests = require("../models/ActiveTests");

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
		const cdnToken = generateHashedToken(admin._id);
		return res.json({
			status: "success",
			data: {
				cdn_token: cdnToken,
				auth_token: token,
				token_type: "bearer",
			},
		});
	} catch (error) {
		return res.status(500).json({message: error});
	}
};
exports.getMe = async (req, res) => {
	try {
		const {password, ...result} = req.userId._doc;
		return res.json({
			data: result,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({message: error});
	}
};
exports.createSchool = async (req, res) => {
	try {
		const newSchool = await Schools.create(req.body);
		newSchool.login = `s${newSchool._id}`;
		const hashedCode = await createHash(`s${newSchool._id}`);
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
		const school = await Schools.findById(req.params.id);

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
		school.tarif = req.body.tarif;
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
exports.getTeachersTests = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1; // Get page number from query, default to 1
		const limit = parseInt(req.query.limit) || 10; // Get limit from query, default to 10
		const skip = (page - 1) * limit; // Calculate how many documents to skip

		// Fetch the total count of attempts
		const totalAttempts = await ActiveTests.countDocuments({
			teacher: req.params.id,
		});

		// Fetch paginated attempts
		const attempts = await ActiveTests.find({
			teacher: req.params.id,
		})
			.populate("test_type_id")
			.populate("subject")
			.populate("subject_2")
			.select("-main_test") // Exclude the `main_test` field
			.skip(skip) // Skip the appropriate number of documents
			.limit(limit); // Limit the result to the specified amount

		// Calculate total pages
		const totalPages = Math.ceil(totalAttempts / limit);

		// Construct _meta information
		const _meta = {
			totalItems: totalAttempts,
			itemCount: attempts.length,
			itemsPerPage: limit,
			totalPages: totalPages,
			currentPage: page,
		};

		// Construct _links for pagination navigation
		const baseUrl = `${req.protocol}://${req.get("host")}${req.originalUrl.split("?").shift()}`; // Base URL without query parameters
		const _links = {
			self: `${baseUrl}?page=${page}&limit=${limit}`,
			first: `${baseUrl}?page=1&limit=${limit}`,
			last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
			previous: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
			next:
				page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
		};

		// Send the paginated response with _meta and _links
		return res.status(200).json({
			status: "success",
			message: "success",
			data: attempts,
			_meta,
			_links,
		});
	} catch (error) {
		console.error("Error fetching attempts:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getTestById = async (req, res) => {
	try {
		const attempts = await ActiveTests.findById(req.params.id)
			.populate("test_type_id")
			.populate("subject")
			.populate("subject_2")
			.select("-main_test"); // Exclude the `main_test` field

		return res.status(200).json({
			status: "success",
			message: "success",
			data: attempts,
		});
	} catch (error) {
		console.error("Error fetching attempts:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getPupilsTests = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1; // Get page number from query, default to 1
		const limit = parseInt(req.query.limit) || 10; // Get limit from query, default to 10
		const skip = (page - 1) * limit; // Calculate how many documents to skip

		// Fetch the total count of attempts
		const totalAttempts = await ActiveTests.countDocuments({
			pupil: req.params.id,
		});

		// Fetch paginated attempts
		const attempts = await ActiveTests.find({
			pupil: req.params.id,
		})
			.populate("test_type_id")
			.populate("subject")
			.populate("subject_2")
			.select("-main_test") // Exclude the `main_test` field
			.skip(skip) // Skip the appropriate number of documents
			.limit(limit); // Limit the result to the specified amount

		// Calculate total pages
		const totalPages = Math.ceil(totalAttempts / limit);

		// Construct _meta information
		const _meta = {
			totalItems: totalAttempts,
			itemCount: attempts.length,
			itemsPerPage: limit,
			totalPages: totalPages,
			currentPage: page,
		};

		// Construct _links for pagination navigation
		const baseUrl = `${req.protocol}://${req.get("host")}${req.originalUrl.split("?").shift()}`; // Base URL without query parameters
		const _links = {
			self: `${baseUrl}?page=${page}&limit=${limit}`,
			first: `${baseUrl}?page=1&limit=${limit}`,
			last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
			previous: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
			next:
				page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
		};

		// Send the paginated response with _meta and _links
		return res.status(200).json({
			status: "success",
			message: "success",
			data: attempts,
			_meta,
			_links,
		});
	} catch (error) {
		console.error("Error fetching attempts:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
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
		const subject = await Subjects.findById(req.params.id);

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
exports.getSubjectByClassNumber = async (req, res) => {
	try {
		const subject = await Subjects.find({
			class: req.params.id,
		});

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
exports.getSubjectsByTestTypeId = async (req, res) => {
	try {
		const subjects = await Subjects.find({
			test_type: req.params.id,
		});
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
		const part = await Parts.findById(req.params.id);

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
		console.error("Error updating part by ID:", error);
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
			subject: req.params.id,
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
		const theme = await Themes.findById(req.params.id)
			.populate("part")
			.populate({
				path: "part",
				populate: [{path: "subject"}],
			});

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
			part: req.params.id,
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
exports.setDefaultDatasDTM = async (req, res) => {
	try {
		const default_datas = req.body;
		fs.writeFile(
			"./database/dtm.json",
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
exports.getDefaultDatasDTM = async (req, res) => {
	try {
		fs.readFile("./database/dtm.json", "utf8", (err, data) => {
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
exports.createType = async (req, res) => {
	try {
		const testtype = await TestTypes.create(req.body);
		await testtype.save();
		return res.status(200).json({
			status: "success",
			data: testtype,
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
exports.getAllTypes = async (req, res) => {
	try {
		const testTypes = await TestTypes.find();
		return res.status(200).json({
			status: "success",
			data: testTypes,
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
exports.getTestTypeSubjects = async (req, res) => {
	try {
		const subjects = await Subjects.find({
			test_type: req.params.id,
		});
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
exports.getTypeById = async (req, res) => {
	try {
		const testtypes_id = await TestTypes.findById(req.params.id);

		if (!testtypes_id) {
			return res.status(404).json({
				status: "fail",
				message: "testtypes not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: testtypes_id,
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

exports.updateTypeById = async (req, res) => {
	try {
		const testtype = await TestTypes.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
			},
		);
		if (!testtype) {
			return res.status(500).json({
				status: "error",
				message: "testtype does not exist",
				error: null,
			});
		}
		return res.status(200).json({
			status: "success",
			data: testtype,
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
exports.deleteTypeById = async (req, res) => {
	try {
		const testtype = await TestTypes.findByIdAndDelete(req.params.id);
		if (!testtype) {
			return res.status(500).json({
				status: "error",
				message: "TestTypes does not exist",
				error: null,
			});
		}
		return res.status(200).json({
			status: "success",
			data: testtype,
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
exports.createUniversity = async (req, res) => {
	try {
		const university = await Universities.create(req.body);
		await university.save();
		return res.status(200).json({
			status: "success",
			data: university,
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
exports.getAllUniversities = async (req, res) => {
	try {
		let {page = 1, limit = 10} = req.query;
		page = parseInt(page);
		limit = parseInt(limit);
		const skip = (page - 1) * limit;
		let universities = await Universities.find().skip(skip).limit(limit);
		const total = await Universities.countDocuments();
		const response = paginate(
			page,
			limit,
			total,
			universities,
			req.baseUrl,
			req.path,
		);

		return res.json(response);
	} catch (error) {
		console.error("Error updating school by ID:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.getUniversityById = async (req, res) => {
	try {
		const university = await Universities.findById(req.params.id);

		if (!university) {
			return res.status(404).json({
				status: "fail",
				message: "university not found",
			});
		}

		return res.status(200).json({
			status: "success",
			data: university,
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
exports.updateUniversityById = async (req, res) => {
	try {
		const university = await Universities.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
			},
		);
		if (!university) {
			return res.status(500).json({
				status: "error",
				message: "university does not exist",
				error: null,
			});
		}
		return res.status(200).json({
			status: "success",
			data: university,
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
exports.updateSubjectsUsedirn = async (req, res) => {
	try {
		const {dirid, subject_1, subject_2} = req.body;

		// Check if dirid or updatePayload is missing
		if (!dirid || !subject_1 || !subject_2) {
			return res.status(400).json({
				status: "error",
				message: "Missing 'dirid' or 'updatePayload' in request body",
			});
		}

		// Update multiple documents
		const result = await Universities.updateMany(
			{dirid}, // Match condition
			{subject_1, subject_2}, // Fields to update
			{new: true}, // Return updated documents
		);

		// Check if any documents were matched and updated
		if (result.matchedCount === 0) {
			return res.status(404).json({
				status: "error",
				message: "No universities found with the given dirid",
			});
		}

		return res.status(200).json({
			status: "success",
			message: "Universities updated successfully",
			data: result,
		});
	} catch (error) {
		console.error("Error updating universities by dirid:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.deleteUniversityById = async (req, res) => {
	try {
		const university = await Universities.findByIdAndDelete(req.params.id);
		if (!university) {
			return res.status(500).json({
				status: "error",
				message: "university does not exist",
				error: null,
			});
		}
		return res.status(200).json({
			status: "success",
			data: university,
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
exports.uploadUniversitiesByFile = async (req, res) => {
	try {
		// Assuming the file is sent as `req.file` (for single file upload)
		if (!req.file) {
			return res.status(400).json({
				status: "error",
				message: "No file uploaded",
			});
		}

		// Read the uploaded file (assuming JSON format)
		const fileData = fs.readFileSync(req.file.path, "utf8");
		const universities = JSON.parse(fileData);

		// Validation check: Ensure the uploaded file is an array
		if (!Array.isArray(universities)) {
			return res.status(400).json({
				status: "error",
				message: "Uploaded file must contain an array of universities",
			});
		}

		// Insert each university
		for (const uni of universities) {
			await Universities.create(uni);
		}

		// Send response
		return res.status(201).json({
			status: "success",
			message: "data uploaded successfully",
			data: null,
		});
	} catch (error) {
		console.error("Error uploading universities:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
