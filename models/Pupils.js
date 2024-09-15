const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const pupilsSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		school: {
			type: Number,
			ref: "schools",
		},
		class: {
			type: Number,
			ref: "classes",
		},
		name: {
			type: String,
			required: true,
		},
		surname: {
			type: String,
			required: true,
		},
		father_name: {
			type: String,
			required: true,
		},
		phone_number: {
			type: String,
		},
		login: {
			type: String,
		},
		password: {
			type: String,
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

pupilsSchema.plugin(AutoIncrement, {
	modelName: "pupil",
	fieldName: "_id",
	startAt: 1000,
});
const Pupils = model("pupils", pupilsSchema);

module.exports = Pupils;
