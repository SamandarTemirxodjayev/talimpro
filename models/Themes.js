const {Schema, model, Types} = require("mongoose");
const { AutoIncrement } = require("../utils/helpers");

const themesSchema = new Schema({
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
	part: {
		type: Number,
		required: true,
		ref: "parts",
	},
	createdAt: {
		type: Number,
		default: Date.now()
	}
}, {
	versionKey: false
});

themesSchema.plugin(AutoIncrement, { modelName: 'themes', fieldName: '_id' })

const Themes = model("themes", themesSchema);

module.exports = Themes;
