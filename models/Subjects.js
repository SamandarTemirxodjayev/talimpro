const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const subjectsSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		test_type: {
			type: Number,
			ref: "testtypes",
		},
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
		class: {
			type: Number,
			default: 0,
		},
		createdAt: {
			type: Number,
			default: Date.now(),
		},
	},
	{
		versionKey: false,
	},
);

subjectsSchema.plugin(AutoIncrement, {modelName: "subject", fieldName: "_id"});
const Subjects = model("subjects", subjectsSchema);

module.exports = Subjects;
