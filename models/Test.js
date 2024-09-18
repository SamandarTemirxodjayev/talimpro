const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const testSchema = new mongoose.Schema({
	_id: {
		type: Number,
	},
	subject: {
		type: Number,
		required: true,
		ref: "subjects",
	},
	part: {
		type: Number,
		ref: "parts",
	},
	theme: {
		type: Number,
		ref: "themes",
	},
	test_type: {
		type: Number,
		ref: "testtypes",
	},
	questions: {
		type: [
			{
				question_text: {
					type: String,
					required: true,
				},
				options: {
					type: [
						{
							text: {
								type: String,
								required: true,
							},
							is_correct: {
								type: Boolean,
								required: true,
								default: false,
							},
						},
					],
					required: true,
				},
			},
		],
		required: true,
	},
});

testSchema.plugin(AutoIncrement, {
	modelName: "test",
	fieldName: "_id",
	startAt: 1000,
});

const Test = mongoose.model("Test", testSchema);

module.exports = Test;
