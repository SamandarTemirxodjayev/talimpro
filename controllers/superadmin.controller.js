const Schools = require("../models/Schools");
const Superadmins = require("../models/Superadmins");
const {createHash, compare} = require("../utils/codeHash");
const {createToken} = require("../utils/token");
const mongoose = require("mongoose");

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
