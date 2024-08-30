const { Schema, model, Types } = require("mongoose");
const { AutoIncrement } = require("../utils/helpers");

const partsSchema = new Schema({
	_id: {
		type: Number,
	},
	name_uz: {
		type: String,
		required: true,
	},
	name_ru: {
		type: String,
		required: true,
	},
	name_en: {
		type: String,
		required: true,
	},
	subject: {
		type: Number,
		required: true,
		ref: "subjects",
	}, 
	createdAt: {
		type: Number,
		default: Date.now()
	}
}, {
	versionKey: false
});

partsSchema.plugin(AutoIncrement, { modelName: 'part', fieldName: '_id' })

const Parts = model("parts", partsSchema);

module.exports = Parts;
