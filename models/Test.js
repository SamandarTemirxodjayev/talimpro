const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const testSchema = new mongoose.Schema({
	subject: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: "subjects",
	},
	part: {
		type: mongoose.Types.ObjectId,
		ref: "parts",
	},
	theme: {
		type: mongoose.Types.ObjectId,
		ref: "themes",
	},
	banner_photo: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		enum: ["teacher", "pupils"],
		required: true,
	},
	pupil_class: {
		type: Number,
		default: 0,
	},
	duration: {
		type: Number,
		default: 120,
	},
	questions_count: {
		type: Number,
		default: 30,
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
	inc_field: "test_id",
	start_seq: 1,
});
testSchema.set("timestamps", true);

const Test = mongoose.model("Test", testSchema);

module.exports = Test;
