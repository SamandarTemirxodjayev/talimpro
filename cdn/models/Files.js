const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const filesSchema = new mongoose.Schema({
	user: {
		type: String,
	},
	fileName: {
		type: String,
	},
	fileId: {
		type: String,
	},
	fileUrl: {
		type: String,
	},
});
filesSchema.set("timestamps", true);
filesSchema.plugin(AutoIncrement, {
	inc_field: "file_id",
	start_seq: 1,
});


const Files = mongoose.model("files", filesSchema);

module.exports = Files;
