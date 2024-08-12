const Classes = require("../models/Classes");
const Pupils = require("../models/Pupils");
const Teachers = require("../models/Teachers");

exports.getStatistics = async (req, res) => {
	try {
		const schools = await Pupils.countDocuments({});
		const teachers = await Teachers.countDocuments({});
		const classes = await Classes.countDocuments({});
		const pupils = await Pupils.countDocuments({});
		return res.json({
			status: "success",
			data: {
				schools,
				teachers,
				classes,
				pupils,
			},
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
