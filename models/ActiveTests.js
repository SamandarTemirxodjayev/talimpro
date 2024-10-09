const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const activeTestsSchema = new Schema({
	_id: {
		type: Number,
	},
	teacher: {
		type: Number,
		ref: "teachers",
	},
	pupil: {
		type: Number,
		ref: "pupils",
	},
	test_type_id: {
		type: Number,
		ref: "testtypes",
	},
	subject: {
		type: Number,
		ref: "subjects",
	},
	main_test: [
		{
			question_text: {
				type: String,
				required: true,
			},
			options: [
				{
					text: {
						type: String,
						required: true,
					},
					is_correct: {
						type: Boolean,
						default: false,
					},
					is_selected: {
						type: Boolean,
						default: false,
					},
				},
			],
		},
	],
	startedAt: {
		type: Number,
		default: Date.now(),
	},
	createdAt: {
		type: Number,
	},
	updatedAt: {
		type: Number,
	},
});

activeTestsSchema.set("timestamps", true);
activeTestsSchema.plugin(AutoIncrement, {
	modelName: "active_test_id",
	fieldName: "_id",
});

const ActiveTests = model("activetests", activeTestsSchema);

module.exports = ActiveTests;
