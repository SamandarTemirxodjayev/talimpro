const {Schema, model} = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const subjectsSchema = new Schema({
	name_uz: {
		type: String,
		required: true,
	},
	name_ru: {
		type: String,
		required: true,
	},
	name_en: {
		type: String,
		required: true,
	},
});

subjectsSchema.set("timestamps", true);
subjectsSchema.plugin(AutoIncrement, {
	inc_field: "subject_id",
	start_seq: 1,
});

const Subjects = model("subjects", subjectsSchema);

module.exports = Subjects;
