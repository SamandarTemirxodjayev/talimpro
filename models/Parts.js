const {Schema, model, Types} = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const partsSchema = new Schema({
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
		type: Types.ObjectId,
		required: true,
		ref: "subjects",
	},
});

partsSchema.set("timestamps", true);
partsSchema.plugin(AutoIncrement, {
	inc_field: "part_id",
	start_seq: 1,
});

const Parts = model("parts", partsSchema);

module.exports = Parts;
