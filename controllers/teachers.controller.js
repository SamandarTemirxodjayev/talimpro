const ActiveTests = require("../models/ActiveTests");
const Parts = require("../models/Parts");
const Schools = require("../models/Schools");
const Subjects = require("../models/Subjects");
const Teachers = require("../models/Teachers");
const TestTypes = require("../models/TestTypes");
const Themes = require("../models/Themes");
const {compare, createHash} = require("../utils/codeHash");
const {defaultDatas, randomizeTest} = require("../utils/helpers");
const {createToken} = require("../utils/token");

exports.login = async (req, res) => {
	try {
		const teacher = await Teachers.findOne({login: req.body.login});
		if (!teacher) {
			return res.status(400).json({
				status: "error",
				error: "User not found",
			});
		}

		const isPasswordValid = await compare(req.body.password, teacher.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: "error",
				error: "Invalid password",
			});
		}
		const school = await Schools.findById(teacher.school);

		const currentDate = new Date();
		if (!school.tarif || school.tarif < currentDate) {
			return res.status(400).json({
				status: "error",
				error: "Subscription expired or missing",
			});
		}

		const token = createToken(teacher._id);
		return res.status(200).json({
			status: "success",
			data: {
				token,
				teacher,
			},
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getMe = async (req, res) => {
	try {
		const {password, ...result} = req.teacher._doc;
		return res.json({
			data: result,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.updateProfile = async (req, res) => {
	try {
		const teacher = req.teacher;
		teacher.name = req.body.name;
		teacher.surname = req.body.surname;
		teacher.father_name = req.body.father_name;
		teacher.phone_number = req.body.phone_number;
		await teacher.save();
		return res.json({
			status: "success",
			data: teacher,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.resetPassword = async (req, res) => {
	try {
		const isPasswordValid = await compare(req.body.old, req.teacher.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: "error",
				error: "Invalid password",
			});
		}
		const hashedCode = await createHash(req.body.new);
		req.teacher.password = hashedCode;
		await req.teacher.save();
		const token = await createToken(req.teacher._id);
		return res.json({
			status: "success",
			data: {
				token,
				teacher: req.teacher,
			},
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getTestTypes = async (req, res) => {
	try {
		const testTypes = await TestTypes.find({user_types: {$in: ["teacher"]}});
		return res.status(200).json({
			status: "success",
			data: testTypes,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
exports.getSubjects = async (req, res) => {
	try {
		const subjects = await Subjects.find({test_type: req.params.id});
		return res.status(200).json({
			status: "success",
			data: subjects,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

exports.startTestTeacherIntern = async (req, res) => {
	const {id: testtypeId, subjectId} = req.params;

	try {
		const activeTest = await ActiveTests.findOne({
			teacher: req.teacher._id,
		})
			.populate("teacher")
			.populate("test_type_id")
			.populate("subject");

		if (activeTest) {
			return res.status(400).json({
				status: "error",
				message: "Already have active test",
				data: activeTest,
			});
		}
		// Fetch the test type
		const testType = await TestTypes.findById(testtypeId);
		if (!testType) {
			return res.status(404).json({message: "Test type not found"});
		}

		const durationMs = testType.duration * 60 * 1000; // Convert duration from minutes to milliseconds
		const startTime = Date.now();
		const endTime = startTime + durationMs;

		// Fetch the subject
		const subject = await Subjects.findById(subjectId);
		if (!subject) {
			return res.status(404).json({message: "Subject not found"});
		}

		// Fetch the parts related to the subject
		const parts = await Parts.find({subject: subjectId});

		// Fetch themes related to the parts and gather questions
		let questions = [];
		for (const part of parts) {
			const themes = await Themes.find({part: part._id});
			for (const theme of themes) {
				if (theme.questions && theme.questions.length > 0) {
					questions.push(...theme.questions); // Add all questions to the array
				}
			}
		}

		// Shuffle the questions and take the required amount (testType.questions_count)
		const randomizedQuestions = shuffleArray(questions).slice(
			0,
			testType.questions_count,
		);

		const newActiveTest = await ActiveTests.create({
			teacher: req.teacher._id,
			test_type_id: testType._id,
			main_test: randomizedQuestions,
			subject: subjectId,
		});

		// finish logic for ending time

		// setTimeout(async () => {
		// 	await ActiveTests.findByIdAndUpdate(newActiveTest._id, {
		// 		status: "finished",
		// 	});
		// 	console.log(
		// 		`Test with ID ${newActiveTest._id} finished after ${testType.duration} minutes.`,
		// 	);
		// }, durationMs);

		return res.status(200).json({
			status: "success",
			data: newActiveTest,
		});
	} catch (error) {
		console.error("Error during test creation:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getActiveTestTeacherIntern = async (req, res) => {
	try {
		const activeTest = await ActiveTests.findOne({
			_id: req.params.id,
			teacher: req.teacher._id,
		})
			.populate("teacher")
			.populate("test_type_id")
			.populate("subject");
		return res.status(200).json({
			status: "success",
			data: activeTest,
		});
	} catch (error) {
		console.error("Error during test creation:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.updateSelectedOptionOnActiveTest = async (req, res) => {
	const {activeTestId, mainTestId, optionId} = req.body;

	try {
		// Find the active test by its _id
		const activeTest = await ActiveTests.findOne({_id: activeTestId});
		if (!activeTest) {
			return res
				.status(404)
				.json({status: "error", message: "Active test not found"});
		}

		// Find the main test by main_test._id
		const mainTest = activeTest.main_test.id(mainTestId);
		if (!mainTest) {
			return res
				.status(404)
				.json({status: "error", message: "Main test not found"});
		}

		// Loop through the options and update the is_selected field
		mainTest.options.forEach((option) => {
			if (option._id.toString() === optionId) {
				// Set the selected option to true
				option.is_selected = true;
			} else if (option.is_selected) {
				// Set previously selected option to false
				option.is_selected = false;
			}
		});

		// Save the updated active test document
		await activeTest.save();

		return res.status(200).json({
			status: "success",
			message: "Option selection updated successfully",
			updatedTest: activeTest,
		});
	} catch (error) {
		console.error("Error updating selected option:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
