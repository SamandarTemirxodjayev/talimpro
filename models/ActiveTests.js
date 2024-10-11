const {Schema, model, Types} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const activeTestsSchema = new Schema(
	{
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
		test_type: {
			type: String,
			required: true,
			enum: [
				"dtm",
				"teacher_intern",
				"attestation",
				"school",
				"pmtest",
				"national_certificate",
			],
		},
		test_type_id: {
			type: Number,
			ref: "testtypes",
		},
		subject: {
			type: Number,
			ref: "subjects",
		},
		total_questions: {
			type: Number,
		},
		correct_answers: {
			type: Number,
			default: 0, // Tracks how many answers were correct
		},
		wrong_answers: {
			type: Number,
			default: 0, // Tracks how many answers were wrong
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
				_id: {
					type: Types.ObjectId,
				},
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
		endedAt: {
			type: Number, // Timestamp for when the test ended
		},
		duration: {
			type: Number, // Duration of the test in minutes
		},
		score: {
			type: Number, // Final score of the test
		},
		status: {
			type: String,
			enum: ["in-progress", "completed", "timed-out"],
			default: "in-progress",
		},
		timeoutId: {
			type: Number,
		},
	},
	{
		versionKey: false,
	},
);

activeTestsSchema.set("timestamps", true);
activeTestsSchema.plugin(AutoIncrement, {
	modelName: "active_test_id",
	fieldName: "_id",
});

const ActiveTests = model("activetests", activeTestsSchema);

module.exports = ActiveTests;
