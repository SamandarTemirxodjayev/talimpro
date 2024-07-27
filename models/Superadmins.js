const {Schema, model} = require("mongoose");

const adminsSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	surname: {
		type: String,
		required: true,
	},
	login: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
});

adminsSchema.set("timestamps", true);

const Superadmins = model("admins", adminsSchema);

module.exports = Superadmins;
