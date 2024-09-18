const {Schema, model, Types} = require("mongoose");
const {AutoIncrement} = require("../utils/helpers");

const themesSchema = new Schema(
	{
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
		questions: {
			type: [
				{
					question_text: {
						type: String,
						required: true,
					},
					options: {
						type: [
							{
								text: {
									type: String,
									required: true,
								},
								is_correct: {
									type: Boolean,
									required: true,
									default: false,
								},
							},
						],
						required: true,
					},
				},
			],
			required: true,
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

themesSchema.plugin(AutoIncrement, {modelName: "themes", fieldName: "_id"});

const Themes = model("themes", themesSchema);

module.exports = Themes;
