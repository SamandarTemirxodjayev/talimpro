const {Schema, model} = require("mongoose");
const { AutoIncrement } = require("../utils/helpers");

const testTypesSchema = new Schema({
	_id: {
		type: Number,
	},
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
  },
	createdAt: {
		type: Number,
		default: Date.now()
	}
}, {
	versionKey: false
});

testTypesSchema.plugin(AutoIncrement, { modelName: 'testtypes', fieldName: '_id' })
const TestTypes = model("testtypes", testTypesSchema);

module.exports = TestTypes;
