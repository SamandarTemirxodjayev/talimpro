const {Schema, model, Types} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const classesSchema = new Schema(
	{
		_id: {
			type: Number,
		},
		school: {
			type: Number,
			ref: "schools",
		},
		number: {
			type: Number,
			required: true,
		},
		letter: {
			type: String,
			required: true,
		},
		pupils: {
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
classesSchema.plugin(AutoIncrement, {modelName: "classes", fieldName: "_id"});
const Classes = model("classes", classesSchema);

module.exports = Classes;
