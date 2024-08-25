const {v1: uuidv4} = require("uuid");
const path = require("path");
const multer = require("multer");
const Files = require("./models/Files");

exports.index = async (req, res) => {
	res.json({message: "Storage", version: "1.0.0"});
};
exports.upload = async (req, res) => {
	try {
		const publicFolderPath = `./cdn/public/`;

		const storage = multer.diskStorage({
			destination: publicFolderPath,
			filename: (req, file, cb) => {
				const fileId = uuidv4();
				const fileExtension = path.extname(file.originalname);
				const fileName = `${fileId}${fileExtension}`;
				cb(null, fileName);
			},
		});

		const upload = multer({storage}).single("file");
		upload(req, res, async (err) => {
			if (err) {
				console.error("Error handling file upload:", err);
				return res.status(500).json({message: "Error uploading the file"});
			}

			if (!req.file) {
				return res.status(400).json({message: "No file provided"});
			}

			const fileName = req.file.filename;
			const fileId = path.basename(
				req.file.filename,
				path.extname(req.file.filename),
			); // Get the newly generated filename

			const fileUrl = `https://cdn.talimpro.uz/${fileName}`;

			const files = await Files.create({
				fileName,
				fileId,
				fileUrl,
			});
			await files.save();

			return res.status(200).json({
				message: "File uploaded",
				status: 200,
				data: files,
			});
		});
	} catch (error) {
		return res.status(500).json({message: error.message});
	}
};
