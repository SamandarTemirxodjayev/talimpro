const {Schema, Types, model} = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const activeTestsSchema = new Schema({
	teacher: {
		type: Types.ObjectId,
		ref: "teachers",
	},
	pupil: {
		type: Types.ObjectId,
		ref: "pupils",
	},
	main_test_id: {
		type: Types.ObjectId,
		ref: "tests",
	},
	secondary_test_id: {
		type: Types.ObjectId,
		ref: "tests",
	},
	main_test: {
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
	secondary_test: {
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
	startedAt: {
		type: Date,
		required: true,
		default: Date.now(),
	},
});

activeTestsSchema.set("timestamps", true);
activeTestsSchema.plugin(AutoIncrement, {
	inc_field: "active_test_id",
	start_seq: 1,
});

const ActiveTests = model("activetests", activeTestsSchema);

module.exports = ActiveTests;
