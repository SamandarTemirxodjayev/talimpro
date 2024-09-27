const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const testTypesSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		title_uz: {
			type: String,
			required: true,
		},
		title_ru: {
			type: String,
			required: true,
		},
		title_en: {
			type: String,
			required: true,
		},
		user_types: [
			{
				type: String,
				required: true,
				enum: ["teacher", "pupils", "user"],
			},
		],
		test_type: {
			type: String,
			required: true,
			enum: ["dtm", "school", "attestatsiya"],
		},
		photo_url: {
			type: String,
			required: true,
		},
		duration: {
			type: Number,
			default: 120,
		},
		questions_count: {
			type: Number,
			default: 30,
		},
		createdAt: {
			type: Number,
			default: Date.now(),
		},
		status: {
			type: Boolean,
			default: true,
		},
	},
	{
		versionKey: false,
	},
);

testTypesSchema.plugin(AutoIncrement, {
	modelName: "testtypes",
	fieldName: "_id",
});
const TestTypes = model("testtypes", testTypesSchema);

module.exports = TestTypes;
