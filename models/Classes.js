const {Schema, model, Types} = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const classesSchema = new Schema({
	school: {
		type: Types.ObjectId,
		ref: "schools",
	},
	number: {
		type: Number,
		required: true,
	},
	letter: {
		type: String,
		required: true,
	},
});

classesSchema.set("timestamps", true);
classesSchema.plugin(AutoIncrement, {
	inc_field: "class_id",
	start_seq: 1,
});

const Classes = model("classes", classesSchema);

module.exports = Classes;
