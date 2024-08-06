const {Schema, model, Types} = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const pupulsSchema = new Schema({
	school: {
		type: Types.ObjectId,
		ref: "schools",
	},
	class: {
		type: Types.ObjectId,
		ref: "classes",
	},
	name: {
		type: String,
		required: true,
	},
	surname: {
		type: String,
		required: true,
	},
	father_name: {
		type: String,
		required: true,
	},
	login: {
		type: String,
	},
	password: {
		type: String,
	},
});

pupulsSchema.set("timestamps", true);
pupulsSchema.plugin(AutoIncrement, {
	inc_field: "pupil_id",
	start_seq: 1000,
});

const Pupils = model("pupils", pupulsSchema);

module.exports = Pupils;
