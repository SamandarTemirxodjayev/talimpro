const {Schema, model, Types} = require("mongoose");
const { AutoIncrement } = require("../utils/helpers");


const teachersSchema = new Schema({
	_id: {
		type: Number,
	},
	school: {
		type: Number,
		ref: "schools"
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
		default: Date.now()
	}
}, {
	versionKey: false
});
teachersSchema.plugin(AutoIncrement, { modelName: 'teachers', fieldName: '_id', startAt: 1000 });

const Teachers = model("teachers", teachersSchema);

module.exports = Teachers;
