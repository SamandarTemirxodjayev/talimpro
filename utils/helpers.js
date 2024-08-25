const fs = require("fs");
const Test = require("../models/Test");

exports.defaultDatas = (filePath) => {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, "utf8", (err, data) => {
			if (err) {
				console.error(err);
				return reject({error: "Failed to read file"});
			}
			try {
				const file = JSON.parse(data);
				resolve(file);
			} catch (parseError) {
				reject({error: "Failed to parse JSON"});
			}
		});
	});
};

exports.randomizeTest = async (testId) => {
	try {
		const test = await Test.findById(testId);

		if (!test) {
			throw new Error("Test not found");
		}

		const shuffledQuestions = test.questions.sort(() => 0.5 - Math.random());
		const selectedQuestions = shuffledQuestions.slice(0, test.questions_count);

		return selectedQuestions;
	} catch (error) {
		console.error("Error fetching test:", error);
		return null;
	}
};
