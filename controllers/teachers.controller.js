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
		// Check for an already active test for the teacher
		const activeTest = await ActiveTests.findOne({
			teacher: req.teacher._id,
			status: "in-progress",
		});

		if (activeTest) {
			return res.status(400).json({
				status: "error",
				message: "Already have an active test",
				data: {
					active_test_id: activeTest._id,
				},
			});
		}

		// Fetch the test type
		const testType = await TestTypes.findById(testtypeId);
		if (!testType) {
			return res.status(404).json({message: "Test type not found"});
		}

		const durationMs = testType.duration * 60 * 1000; // Convert duration from minutes to milliseconds
		const startTime = Date.now();

		// Fetch the subject
		const subject = await Subjects.findById(subjectId);
		if (!subject) {
			return res.status(404).json({message: "Subject not found"});
		}

		// Fetch the parts and themes related to the subject
		const parts = await Parts.find({subject: subjectId});
		let questions = [];

		for (const part of parts) {
			const themes = await Themes.find({part: part._id});
			for (const theme of themes) {
				if (theme.questions && theme.questions.length > 0) {
					questions.push(...theme.questions);
				}
			}
		}

		// Shuffle the questions and take the required amount (testType.questions_count)
		const randomizedQuestions = shuffleArray(questions).slice(
			0,
			testType.questions_count,
		);

		// Create a new active test
		const newActiveTest = await ActiveTests.create({
			teacher: req.teacher._id,
			test_type_id: testType._id,
			main_test: randomizedQuestions,
			subject: subjectId,
			startedAt: startTime,
			test_type: "teacher_intern",
		});

		// Logic to handle test timeout
		const timeoutId = setTimeout(async () => {
			try {
				// Check if the test is still active
				const stillActive = await ActiveTests.findById(newActiveTest._id);
				if (stillActive && stillActive.status === "in-progress") {
					let correctAnswers = 0;
					let wrongAnswers = 0;

					// Loop through the questions and their options to calculate correct/wrong answers
					stillActive.main_test.forEach((question) => {
						let optionSelected = false; // Track if any option was selected for this question

						question.options.forEach((option) => {
							if (option.is_selected) {
								optionSelected = true; // Mark that an option was selected
								if (option.is_correct) {
									correctAnswers++;
								} else {
									wrongAnswers++;
								}
							}
						});

						// If no option was selected for this question, consider it a wrong answer
						if (!optionSelected) {
							wrongAnswers++;
						}
					});

					// Update the test with the correct and wrong answers count
					await ActiveTests.findByIdAndUpdate(newActiveTest._id, {
						status: "timed-out",
						endedAt: Date.now(),
						correct_answers: correctAnswers,
						wrong_answers: wrongAnswers,
					});

					console.log(
						`Test with ID ${newActiveTest._id} timed-out after ${testType.duration} minutes.`,
					);
					console.log(
						`Correct Answers: ${correctAnswers}, Wrong Answers: ${wrongAnswers}`,
					);
				}
			} catch (error) {
				console.error("Error while handling timeout:", error);
			}
		}, durationMs);

		// Store the timeout ID in case we need to cancel it later
		newActiveTest.timeoutId = timeoutId;
		await newActiveTest.save();

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

		// Check if the test is in progress, prevent editing if it's not
		if (activeTest.status !== "in-progress") {
			return res.status(400).json({
				status: "error",
				message: "Cannot update options. Test is not in progress.",
			});
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
exports.finishTestTeacherIntern = async (req, res) => {
	const {activeTestId} = req.params;

	try {
		// Find the active test by its ID
		const activeTest = await ActiveTests.findOne({_id: activeTestId});
		if (!activeTest) {
			return res
				.status(404)
				.json({status: "error", message: "Active test not found"});
		}

		// Check if the test is still in progress
		if (activeTest.status !== "in-progress") {
			return res.status(400).json({
				status: "error",
				message: "Test is not in progress. Cannot finish a non-active test.",
			});
		}

		// Variables to track correct and wrong answers
		let correctAnswers = 0;
		let wrongAnswers = 0;

		// Loop through the questions and count correct and wrong answers
		activeTest.main_test.forEach((question) => {
			let isQuestionAnswered = false; // Flag to track if a question has been answered

			question.options.forEach((option) => {
				if (option.is_selected) {
					isQuestionAnswered = true;
					if (option.is_correct) {
						correctAnswers++;
					} else {
						wrongAnswers++;
					}
				}
			});

			// If no option was selected for a question, it is considered wrong
			if (!isQuestionAnswered) {
				wrongAnswers++;
			}
		});

		// Mark the test as completed, update the `endedAt` timestamp
		activeTest.endedAt = Date.now();
		activeTest.correct_answers = correctAnswers;
		activeTest.wrong_answers = wrongAnswers;
		activeTest.status = "completed";

		// Optional: Calculate the score based on correct answers
		const totalQuestions = activeTest.main_test.length;
		const score = ((correctAnswers / totalQuestions) * 100).toFixed(2); // Score as a percentage
		activeTest.score = score;

		// Save the updated test
		await activeTest.save();

		return res.status(200).json({
			status: "success",
			message: "Test finished successfully",
			data: {
				correctAnswers,
				wrongAnswers,
				totalQuestions,
				score,
				activeTest,
			},
		});
	} catch (error) {
		console.error("Error finishing test:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
