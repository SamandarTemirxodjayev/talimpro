const mongoose = require("mongoose");
const { AutoIncrement } = require("../../utils/helpers");

const filesSchema = new mongoose.Schema({
	_id: {
		type: Number,
	},
	file_name: {
		type: String,
	},
	file_id: {
		type: mongoose.Types.ObjectId,
	},
	file_url: {
		type: String,
	},
	admin_id: {
		type: Number,
		ref: "admins"
	},
	createdAt: {
		type: Number,
	},
	updatedAt: {
		type: Number,
	}
},{
  versionKey: false
});
filesSchema.set("timestamps", true);
filesSchema.plugin(AutoIncrement, { modelName: 'file', fieldName: '_id' });


const Files = mongoose.model("files", filesSchema);

module.exports = Files;
