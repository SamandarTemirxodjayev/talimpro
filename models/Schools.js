const {Schema, model} = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const schoolsSchema = new Schema({
	number: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	region: {
		type: String,
		required: true,
	},
	district: {
		type: String,
		required: true,
	},
	tarif: {
		type: Date,
	},
	login: {
		type: String,
	},
	password: {
		type: String,
	},
});

schoolsSchema.set("timestamps", true);
schoolsSchema.plugin(AutoIncrement, {inc_field: "school_id", start_seq: 1000});

const Schools = model("schools", schoolsSchema);

module.exports = Schools;
