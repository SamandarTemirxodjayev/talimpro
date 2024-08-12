const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

// Define the schema for answer options
const optionSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
	},
	isCorrect: {
		type: Boolean,
		required: true,
		default: false,
	},
});

// Define the schema for questions
const questionSchema = new mongoose.Schema({
	questionText: {
		type: String,
		required: true,
	},
	options: {
		type: [optionSchema], // Array of optionSchema
		required: true,
	},
	questionType: {
		type: String,
		enum: ["single", "multiple"], // 'single' for single correct answer, 'multiple' for multiple correct answers
		required: true,
	},
	explanation: {
		type: String, // Optional field for explanation of the answer
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Define the schema for tests
const testSchema = new mongoose.Schema({
	theme: {
		type: String,
		required: true,
	},
	questions: {
		type: [questionSchema], // Array of questionSchema
		required: true,
	},
});

testSchema.plugin(AutoIncrement, {
	inc_field: "test_id",
	start_seq: 1,
});
testSchema.set("timestamps", true);

// Create the Test model
const Test = mongoose.model("Test", testSchema);

module.exports = Test;
