const {Schema, model} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const schema = new Schema(
	{
		_id: {
			type: Number,
		},
		OTM: {
			type: String,
			required: true,
		},
		dirid: {
			type: String,
			required: true,
		},
		dirnm: {
			type: String,
			required: true,
		},
		emnm: {
			type: String,
			required: true,
		},
		langnm: {
			type: String,
			required: true,
		},
		grantnm: {
			type: Number,
			required: true,
		},
		contractnm: {
			type: Number,
			required: true,
		},
		ballgr: {
			type: Number,
			required: true,
		},
		ballk: {
			type: Number,
			required: true,
		},
		subject_1: {
			type: Number,
			ref: "subjects",
		},
		subject_2: {
			type: Number,
			ref: "subjects",
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

schema.plugin(AutoIncrement, {modelName: "university", fieldName: "_id"});
const Universities = model("university", schema);

module.exports = Universities;
