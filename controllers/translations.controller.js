const {updateOrAddObject, deleteObject} = require("../utils/db.updater");
const path = require("path");
const fs = require("fs");
const {open} = require("node:fs/promises");

exports.findByLang = async (req, res) => {
	const filePath = path.join(
		__dirname,
		"../database",
		`${req.params.lang}-lang.json`,
	);
	// Read the file
	// fs.readFile(filePath, 'utf8', (err, data) => {
	//   if (err) {
	//     if (err.code === 'ENOENT') {
	//       // If file doesn't exist, return a 404 response
	//       return res.status(404).json({ message: 'File not found' });
	//     }
	//     // Any other errors return a 500 response
	//     return res.status(500).json({ message: 'Error reading file', error: err });
	//   }

	//   try {
	//     // Parse file content to JSON
	//     const jsonData = JSON.parse(data);
	//     return res.json({
	//       status: "success",
	//       data: jsonData
	//     }); // Return JSON response
	//   } catch (parseError) {
	//     // Handle JSON parsing errors
	//     return res.status(500).json({ message: 'Error parsing JSON', error: parseError });
	//   }
	// });
	try {
		let filehandle = await open(filePath, "r");
		let data = "";
		for await (const line of filehandle.readLines()) {
			data += line;
		}
		return res.json({
			data: JSON.parse(data),
		});
	} catch (error) {
		return res.status(500).json({
			error,
		});
	}
};
exports.createLang = async (req, res) => {
	try {
		await updateOrAddObject(
			`./database/${req.params.lang}-lang.json`,
			req.body,
		);
		return res.json({
			status: "success",
			data: {
				message: "add successfully",
			},
		});
	} catch (error) {
		console.log(error);
		return res.json(error);
	}
};
exports.deleteObj = async (req, res) => {
	try {
		await deleteObject(
			`./database/${req.params.lang}-lang.json`,
			req.params.name,
		);
		return res.json({
			message: "success",
			data: {
				message: "deleted successfully",
			},
		});
	} catch (error) {
		console.log(error);
		return res.json(error);
	}
};
