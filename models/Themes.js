const {Schema, model, Types} = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const themesSchema = new Schema({
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
		type: Types.ObjectId,
		required: true,
		ref: "parts",
	},
});

themesSchema.set("timestamps", true);
themesSchema.plugin(AutoIncrement, {
	inc_field: "theme_id",
	start_seq: 1,
});

const Themes = model("themes", themesSchema);

module.exports = Themes;
