const fs = require("fs");
const Test = require("../models/Test");
const Counter = require("../models/Counter");

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
exports.AutoIncrement = function (schema, options) {
  const { modelName, fieldName, startAt = 1 } = options; // Added startAt with a default value

  schema.pre("save", async function (next) {
    if (this.isNew) {
      try {
        const counter = await Counter.findOneAndUpdate(
          { model: modelName, field: fieldName },
          { $inc: { count: 1 } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (counter.count === 1 && startAt > 1) {
          // Initialize counter with startAt if it’s the first document and startAt is greater than 1
          await Counter.updateOne(
            { model: modelName, field: fieldName },
            { $set: { count: startAt } }
          );
          this[fieldName] = startAt;
        } else {
          this[fieldName] = counter.count;
        }

        next();
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  });
};