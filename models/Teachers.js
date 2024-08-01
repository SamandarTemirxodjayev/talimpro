const {Schema, model, Types} = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const teachersSchema = new Schema({
	school: {
		type: Types.ObjectId,
		ref: "schools",
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
	phone_number: {
		type: String,
	},
	login: {
		type: String,
	},
	password: {
		type: String,
	},
});

teachersSchema.set("timestamps", true);
teachersSchema.plugin(AutoIncrement, {
	inc_field: "teacher_id",
	start_seq: 1000,
});

const Teachers = model("teachers", teachersSchema);

module.exports = Teachers;
