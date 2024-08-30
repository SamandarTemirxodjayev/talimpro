const {Schema, model} = require("mongoose");
const { AutoIncrement } = require("../utils/helpers");

const schoolsSchema = new Schema({
	_id: {
		type: Number,
	},
	number: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	region: {
		type: String,
		required: true,
	},
	district: {
		type: String,
		required: true,
	},
	tarif: {
		type: Number,
	},
	login: {
		type: String,
	},
	password: {
		type: String,
	},
	createdAt: {
		type: Number,
		default: Date.now()
	},
},{
  versionKey: false
});

schoolsSchema.plugin(AutoIncrement, { modelName: 'schools', fieldName: '_id', startAt: 1000 })
const Schools = model("schools", schoolsSchema);

module.exports = Schools;
