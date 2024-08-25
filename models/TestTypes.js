const {Schema, model, Types} = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(require("mongoose"));

const testTypesSchema = new Schema({
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
  user_types: [{
    type: String,
    required: true,
    enum: ["teacher", "pupils", "user"],
  }],
  photo_url: {
    type: String,
    required: true,
  }
});

testTypesSchema.set("timestamps", true);
testTypesSchema.plugin(AutoIncrement, {
	inc_field: "testtypes_id",
	start_seq: 1,
});

const TestTypes = model("testtypes", testTypesSchema);

module.exports = TestTypes;
