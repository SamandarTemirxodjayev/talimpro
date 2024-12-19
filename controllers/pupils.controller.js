const ActiveTests = require("../models/ActiveTests");
const Parts = require("../models/Parts");
const Pupils = require("../models/Pupils");
const Schools = require("../models/Schools");
const Subjects = require("../models/Subjects");
const TestTypes = require("../models/TestTypes");
const Themes = require("../models/Themes");
const Universities = require("../models/Universities");
const {compare} = require("../utils/codeHash");
const {createToken} = require("../utils/token");
const fs = require("fs");

exports.login = async (req, res) => {
	try {
		const pupil = await Pupils.findOne({login: req.body.login});
		if (!pupil) {
			return res.status(400).json({
				status: "error",
				error: "User not found",
			});
		}

		const isPasswordValid = await compare(req.body.password, pupil.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: "error",
				error: "Invalid password",
			});
		}

		const school = await Schools.findById(pupil.school);

		const currentDate = Date().now;
		if (!school.tarif || school.tarif < currentDate) {
			return res.status(400).json({
				status: "error",
				error: "Subscription expired or missing",
			});
		}

		const token = createToken(pupil._id);
		return res.status(200).json({
			status: "success",
			data: {
				token,
				pupil,
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
exports.getme = async (req, res) => {
	try {
		const pupil = await Pupils.findById(req.pupil._id)
			.populate("class")
			.populate("school")
			.exec();
		if (!pupil) {
			return res.status(404).json({
				status: "error",
				message: "Pupil not found",
			});
		}

		const {password, ...result} = pupil._doc;
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

exports.updatePupilProfile = async (req, res) => {
	try {
		const school = await Pupils.findByIdAndUpdate(req.pupil._id, req.body, {
			new: true,
		});
		return res.json({
			status: "success",
			data: school,
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
		const isPasswordValid = await compare(req.body.old, req.pupil.password);
		if (!isPasswordValid) {
			return res.status(400).json({
				status: "error",
				error: "Invalid password",
			});
		}
		const hashedCode = await createHash(req.body.new);
		req.pupil.password = hashedCode;
		await req.pupil.save();
		const token = await createToken(req.pupil._id);
		return res.json({
			status: "success",
			data: {
				token,
				pupil: req.pupil,
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
		const testTypes = await TestTypes.find({user_types: {$in: ["pupils"]}});
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
exports.getUniversities = async (req, res) => {
	try {
		const {search} = req.query;

		// Validate the input
		if (!search) {
			const universities = await Universities.find()
				.populate("subject_1")
				.populate("subject_2");
			return res.json({
				status: "success",
				message: "success",
				data: universities,
			});
		}

		console.log("Search query received:", search);

		// Search and group by OTM to avoid duplicates
		const universities = await Universities.aggregate([
			{
				$match: {
					OTM: {$regex: search.trim(), $options: "i"}, // Case-insensitive partial search
				},
			},
			{
				$group: {
					_id: "$OTM",
					anyUniversity: {$first: "$$ROOT"}, // Select one document per group
				},
			},
			{
				$replaceRoot: {newRoot: "$anyUniversity"}, // Replace root with grouped document
			},
		]);

		console.log("Universities found:", universities);

		// Handle no results
		if (!universities.length) {
			return res.status(404).json({
				status: "error",
				message: "No universities found matching the search query",
			});
		}

		return res.status(200).json({
			status: "success",
			data: universities,
		});
	} catch (error) {
		console.error("Error during university search:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getFacutets = async (req, res) => {
	try {
		const facutets = await Universities.find(req.body)
			.populate("subject_1")
			.populate("subject_2");
		return res.json({
			status: "success",
			data: facutets,
		});
	} catch (error) {
		console.error("Error during university search:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getSubjectsForSchool = async (req, res) => {
	try {
		const subjects = await Subjects.find({
			test_type: req.params.id,
			class: req.pupil.class.number,
		});
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
const shuffleArray = (array) => {
	if (!Array.isArray(array)) {
		throw new TypeError("Expected an array to shuffle.");
	}
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
};
exports.startTestNationalCertificate = async (req, res) => {
	const {id: testtypeId, subjectId} = req.params;

	try {
		// Check for an already active test for the teacher
		const activeTest = await ActiveTests.findOne({
			pupil: req.pupil._id,
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
		if (questions <= testType.questions_count) {
			return res.status(400).json({
				message: "not have questions",
			});
		}

		// Shuffle the questions and take the required amount (testType.questions_count)
		const randomizedQuestions = shuffleArray(questions).slice(
			0,
			testType.questions_count,
		);

		// Create a new active test
		const newActiveTest = await ActiveTests.create({
			pupil: req.pupil._id,
			test_type_id: testType._id,
			main_test: randomizedQuestions,
			subject: subjectId,
			startedAt: startTime,
			test_type: "national_certificate",
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
exports.finishTestNationalCertificate = async (req, res) => {
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
exports.getActiveNationalCertificate = async (req, res) => {
	try {
		const activeTest = await ActiveTests.findOne({
			_id: req.params.id,
			pupil: req.pupil._id,
		})
			.populate("pupil")
			.populate("test_type_id")
			.populate("subject_2")
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
exports.startTestSchool = async (req, res) => {
	const {id: testtypeId, subjectId} = req.params;

	try {
		// Check for an already active test for the teacher
		const activeTest = await ActiveTests.findOne({
			pupil: req.pupil._id,
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
		if (questions.length <= testType.questions_count) {
			return res.status(400).json({
				message: "not have questions",
			});
		}

		// Shuffle the questions and take the required amount (testType.questions_count)
		const randomizedQuestions = shuffleArray(questions).slice(
			0,
			testType.questions_count,
		);

		// Create a new active test
		const newActiveTest = await ActiveTests.create({
			pupil: req.pupil._id,
			test_type_id: testType._id,
			main_test: randomizedQuestions,
			subject: subjectId,
			startedAt: startTime,
			test_type: "school",
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
exports.finishTestSchool = async (req, res) => {
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
exports.startTestDTM = async (req, res) => {
	const {id: testtypeId, universityId} = req.params;

	try {
		// Check if there is already an active test
		const activeTest = await ActiveTests.findOne({
			pupil: req.pupil._id,
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

		// Fetch test type and validate
		const testType = await TestTypes.findById(testtypeId);
		if (!testType) {
			return res.status(404).json({message: "Test type not found"});
		}
		const durationMs = testType.duration * 60 * 1000; // Convert duration from minutes to milliseconds
		const startTime = Date.now();

		// Fetch university and validate
		const university = await Universities.findById(universityId);
		if (!university) {
			return res.status(404).json({message: "University not found"});
		}

		// Load subject IDs from `dtm.json`
		let dtmData;
		try {
			dtmData = JSON.parse(fs.readFileSync("./database/dtm.json", "utf8"));
		} catch (err) {
			return res.status(500).json({
				status: "error",
				message: "Failed to load subject IDs from dtm.json.",
			});
		}

		const {subject_1, subject_2, subject_3} = dtmData;

		// Function to get questions for each subject
		const fetchQuestionsForSubject = async (subjectId, maxCount) => {
			// Fetch the subject and its parts
			const parts = await Parts.find({subject: subjectId});

			// Collect all questions across themes of each part
			let questions = [];

			for (const part of parts) {
				const themes = await Themes.find({part: part._id});

				// Collect questions from all themes
				for (const theme of themes) {
					if (theme.questions && theme.questions.length > 0) {
						questions.push(...theme.questions);
					}
				}
			}

			// Shuffle and select a random subset of questions
			return shuffleArray(questions).slice(0, maxCount);
		};

		// Fetch questions for each subject and prepare the test
		const mainTest = []
			.concat(await fetchQuestionsForSubject(subject_1, 10))
			.concat(await fetchQuestionsForSubject(subject_2, 10))
			.concat(await fetchQuestionsForSubject(subject_3, 10));

		const secondaryTest = await fetchQuestionsForSubject(subject_1, 30);
		const thirdTest = await fetchQuestionsForSubject(subject_2, 30);

		if (mainTest.length <= 30) {
			return res.status(400).json({
				message: "not have questions",
			});
		}
		if (secondaryTest.length <= 30) {
			return res.status(400).json({
				message: "not have questions",
			});
		}
		if (thirdTest.length <= 30) {
			return res.status(400).json({
				message: "not have questions",
			});
		}

		// Create the active test
		const newActiveTest = await ActiveTests.create({
			pupil: req.pupil._id,
			test_type_id: testType._id,
			test_type: "dtm",
			main_test: mainTest,
			secondary_test: secondaryTest,
			third_test: thirdTest,
			startedAt: Date.now(),
		});
		const timeoutId = setTimeout(async () => {
			try {
				// Check if the test is still active
				const stillActive = await ActiveTests.findById(newActiveTest._id);
				if (stillActive && stillActive.status === "in-progress") {
					let correctAnswers = 0;
					let wrongAnswers = 0;
					let score = 0;

					// Loop through the questions and their options to calculate correct/wrong answers
					stillActive.main_test.forEach((question) => {
						let optionSelected = false; // Track if any option was selected for this question

						question.options.forEach((option) => {
							if (option.is_selected) {
								optionSelected = true; // Mark that an option was selected
								if (option.is_correct) {
									correctAnswers++;
									score += 1.1;
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

					stillActive.secondary_test.forEach((question) => {
						let optionSelected = false; // Track if any option was selected for this question

						question.options.forEach((option) => {
							if (option.is_selected) {
								optionSelected = true; // Mark that an option was selected
								if (option.is_correct) {
									correctAnswers++;
									score += 2.1;
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

					stillActive.third_test.forEach((question) => {
						let optionSelected = false; // Track if any option was selected for this question

						question.options.forEach((option) => {
							if (option.is_selected) {
								optionSelected = true; // Mark that an option was selected
								if (option.is_correct) {
									correctAnswers++;
									score += 3.1;
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
			message: "Test created successfully.",
			data: newActiveTest,
		});
	} catch (error) {
		console.error("Error during test creation:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
			error: error.message,
		});
	}
};
exports.updateSelectedOptionOnActiveTestDTM = async (req, res) => {
	const {activeTestId, section, testId, optionId} = req.body;

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

		// Select the appropriate test section based on the section parameter
		let testSection = [];
		if (section === "main") {
			testSection = activeTest.main_test;
		} else if (section === "secondary") {
			testSection = activeTest.secondary_test;
		} else if (section === "third") {
			testSection = activeTest.third_test;
		} else {
			return res.status(400).json({
				status: "error",
				message:
					"Invalid section specified. Choose from 'main', 'secondary', or 'third'.",
			});
		}

		// Find the specific test in the selected section (main, secondary, or third)
		const test = testSection.id(testId);
		if (!test) {
			return res.status(404).json({
				status: "error",
				message: `${section.charAt(0).toUpperCase() + section.slice(1)} test not found`,
			});
		}

		// Loop through the options and update the is_selected field
		test.options.forEach((option) => {
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

exports.finishTestDTM = async (req, res) => {
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
		let score = 0;

		// Loop through the questions and count correct and wrong answers
		stillActive.main_test.forEach((question) => {
			let optionSelected = false; // Track if any option was selected for this question

			question.options.forEach((option) => {
				if (option.is_selected) {
					optionSelected = true; // Mark that an option was selected
					if (option.is_correct) {
						correctAnswers++;
						score += 1.1;
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

		stillActive.secondary_test.forEach((question) => {
			let optionSelected = false; // Track if any option was selected for this question

			question.options.forEach((option) => {
				if (option.is_selected) {
					optionSelected = true; // Mark that an option was selected
					if (option.is_correct) {
						correctAnswers++;
						score += 2.1;
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

		stillActive.third_test.forEach((question) => {
			let optionSelected = false; // Track if any option was selected for this question

			question.options.forEach((option) => {
				if (option.is_selected) {
					optionSelected = true; // Mark that an option was selected
					if (option.is_correct) {
						correctAnswers++;
						score += 3.1;
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

		// Mark the test as completed, update the `endedAt` timestamp
		activeTest.endedAt = Date.now();
		activeTest.correct_answers = correctAnswers;
		activeTest.wrong_answers = wrongAnswers;
		activeTest.status = "completed";

		// Optional: Calculate the score based on correct answers
		const totalQuestions = 90;
		// const score = ((correctAnswers / totalQuestions) * 100).toFixed(2); // Score as a percentage
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
exports.myAttempts = async (req, res) => {
	try {
		// Pagination setup
		const page = parseInt(req.query.page) || 1; // Get page number from query, default to 1
		const limit = parseInt(req.query.limit) || 10; // Get limit from query, default to 10
		const skip = (page - 1) * limit; // Calculate how many documents to skip

		// Fetch the total count of attempts
		const totalAttempts = await ActiveTests.countDocuments({
			pupil: req.pupil._id,
		});

		// Fetch paginated attempts
		const attempts = await ActiveTests.find({
			pupil: req.pupil._id,
		})
			.populate("test_type_id")
			.populate("subject")
			.populate("subject_2")
			.select("-main_test") // Exclude the `main_test` field
			.skip(skip) // Skip the appropriate number of documents
			.limit(limit); // Limit the result to the specified amount

		// Calculate total pages
		const totalPages = Math.ceil(totalAttempts / limit);

		// Construct _meta information
		const _meta = {
			totalItems: totalAttempts,
			itemCount: attempts.length,
			itemsPerPage: limit,
			totalPages: totalPages,
			currentPage: page,
		};

		// Construct _links for pagination navigation
		const baseUrl = `${req.protocol}://${req.get("host")}${req.originalUrl.split("?").shift()}`; // Base URL without query parameters
		const _links = {
			self: `${baseUrl}?page=${page}&limit=${limit}`,
			first: `${baseUrl}?page=1&limit=${limit}`,
			last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
			previous: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
			next:
				page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
		};

		// Send the paginated response with _meta and _links
		return res.status(200).json({
			status: "success",
			message: "success",
			data: attempts,
			_meta,
			_links,
		});
	} catch (error) {
		console.error("Error fetching attempts:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.myAttemptgetById = async (req, res) => {
	try {
		// Find the active test by teacher ID and test ID
		const attempt = await ActiveTests.findOne({
			pupil: req.pupil._id,
			_id: req.params.id,
		})
			.populate("test_type_id") // Populate test type
			.populate("subject") // Populate subject
			.populate("subject_2"); // Populate secondary subject

		if (!attempt) {
			return res.status(404).json({
				status: "error",
				message: "Test attempt not found",
			});
		}

		// Prepare a new array to hold updated questions for main_test
		const updatedMainQuestions = [];

		// Iterate over each question in the main_test array
		for (let question of attempt.main_test) {
			// Ensure that both _id values are ObjectIds
			let questionId = question._id;
			if (typeof questionId !== "object") {
				questionId = new mongoose.Types.ObjectId(question._id);
			}

			// Find the corresponding theme based on the question._id
			const theme = await Themes.findOne({
				"questions._id": questionId, // Make sure it's ObjectId type
			}).select("name_uz name_ru name_en part");

			// Create a new question object with the existing question data
			const updatedQuestion = {
				...question._doc, // Use the original question data
				theme: null, // Default theme to null
				part: null, // Default part to null
			};

			if (theme) {
				// Add the theme details to the question
				updatedQuestion.theme = {
					_id: theme._id,
					name_uz: theme.name_uz,
					name_ru: theme.name_ru,
					name_en: theme.name_en,
				};

				// Find the corresponding part based on the theme's part reference
				const part = await Parts.findOne({_id: theme.part}).select(
					"name_uz name_ru name_en",
				);

				// Add the part details to the question
				if (part) {
					updatedQuestion.part = {
						_id: part._id,
						name_uz: part.name_uz,
						name_ru: part.name_ru,
						name_en: part.name_en,
					};
				}
			}

			// Push the updated question to the array
			updatedMainQuestions.push(updatedQuestion);
		}

		let updatedSecondaryQuestions = [];

		// Check if test_type is "attestation", if so, handle secondary_test
		if (attempt.test_type === "attestation") {
			// Iterate over each question in the secondary_test array
			for (let question of attempt.secondary_test) {
				let questionId = question._id;
				if (typeof questionId !== "object") {
					questionId = new mongoose.Types.ObjectId(question._id);
				}

				const theme = await Themes.findOne({
					"questions._id": questionId,
				}).select("name_uz name_ru name_en part");

				const updatedQuestion = {
					...question._doc,
					theme: null,
					part: null,
				};

				if (theme) {
					updatedQuestion.theme = {
						_id: theme._id,
						name_uz: theme.name_uz,
						name_ru: theme.name_ru,
						name_en: theme.name_en,
					};

					const part = await Parts.findOne({_id: theme.part}).select(
						"name_uz name_ru name_en",
					);

					if (part) {
						updatedQuestion.part = {
							_id: part._id,
							name_uz: part.name_uz,
							name_ru: part.name_ru,
							name_en: part.name_en,
						};
					}
				}

				updatedSecondaryQuestions.push(updatedQuestion);
			}
		}

		let newAttempt = JSON.parse(JSON.stringify(attempt));
		newAttempt.main_test = updatedMainQuestions;

		if (attempt.test_type === "attestation") {
			newAttempt.secondary_test = updatedSecondaryQuestions;
		}

		return res.status(200).json({
			status: "success",
			message: "Test fetched successfully",
			data: newAttempt,
		});
	} catch (error) {
		console.error("Error fetching attempt:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.CompareUniversities = async (req, res) => {
	try {
		const university = await Universities.find(req.body);
		return res.json({
			status: "success",
			message: "success",
			data: university,
		});
	} catch (error) {
		console.error("Error fetching attempt:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.myResults = async (req, res) => {
	try {
		const {testtype} = req.query;
		const subjects = await Subjects.find({test_type: testtype}).populate(
			"test_type",
		);

		const subjectResults = [];

		for (let subject of subjects) {
			const tests = await ActiveTests.find({
				subject: subject._id,
				pupil: req.pupil._id,
			});

			let totalCorrect = 0;
			let totalIncorrect = 0;
			let totalQuestions = 0;

			for (let test of tests) {
				for (let question of test.main_test) {
					// Check if the selected option exists
					const selectedOption = question.options.find(
						(opt) => opt.is_selected,
					);
					if (selectedOption) {
						// Only count this question if a selection was made
						totalQuestions += 1;

						// Check if the selected option is correct
						if (selectedOption.is_correct) {
							totalCorrect += 1;
						} else {
							totalIncorrect += 1;
						}
					}
				}
			}

			// Calculate the percentage of correct answers
			const percentage =
				totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

			// Add the results to the subject results array
			subjectResults.push({
				subject,
				total_questions: totalQuestions,
				total_correct: totalCorrect,
				total_incorrect: totalIncorrect,
				percentage_correct: percentage.toFixed(2), // Rounding to two decimal places
			});
		}

		// Return the response with subject results
		return res.status(200).json({
			status: "success",
			data: subjectResults,
		});
	} catch (error) {
		console.error("Error fetching attempt:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.myPartResults = async (req, res) => {
	try {
		// Fetch the subject by ID
		const subject = await Subjects.findById(req.params.subjectId).populate(
			"test_type",
		);

		if (!subject) {
			return res.status(404).json({
				status: "error",
				message: "Subject not found",
			});
		}

		// Fetch all parts related to the subject
		const parts = await Parts.find({subject: subject._id});

		// Initialize array to store part results
		const partResults = [];

		// Iterate over each part
		for (let part of parts) {
			let totalCorrect = 0;
			let totalIncorrect = 0;
			let totalQuestions = 0;

			// Fetch all themes related to the current part
			const themes = await Themes.find({part: part._id});

			// Fetch all active tests related to this subject and teacher
			const tests = await ActiveTests.find({
				subject: subject._id,
				pupil: req.pupil._id,
			});

			// Iterate over each test
			for (let test of tests) {
				for (let question of test.main_test) {
					// Find the theme that the question belongs to
					const theme = await Themes.findOne({
						"questions._id": question._id,
					}).populate("part");

					// Ensure that the theme's part matches the current part
					if (theme && theme.part._id === part._id) {
						//my fixed place i replace theme.part to theme.part._id
						// Check if the question was answered
						const selectedOption = question.options.find(
							(opt) => opt.is_selected,
						);

						if (selectedOption) {
							// Increment the total questions count
							totalQuestions += 1;

							// Check if the selected option is correct
							if (selectedOption.is_correct) {
								totalCorrect += 1;
							} else {
								totalIncorrect += 1;
							}
						}
					}
				}
			}

			// Calculate the percentage of correct answers for this part
			const percentageCorrect =
				totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

			// Add the results for this part
			partResults.push({
				part, // You can use other language fields if needed
				total_questions: totalQuestions,
				total_correct: totalCorrect,
				total_incorrect: totalIncorrect,
				percentage_correct: percentageCorrect.toFixed(2),
			});
		}

		// Return the part results
		return res.status(200).json({
			status: "success",
			data: partResults,
		});
	} catch (error) {
		console.error("Error fetching part results:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
exports.getThemesResults = async (req, res) => {
	try {
		const {subjectId, partId} = req.params; // Assuming subjectId and partId are passed as parameters

		// Fetch the subject by ID
		const subject = await Subjects.findById(subjectId).populate("test_type");

		if (!subject) {
			return res.status(404).json({
				status: "error",
				message: "Subject not found",
			});
		}

		// Fetch the part by ID
		const part = await Parts.findById(partId);

		if (!part) {
			return res.status(404).json({
				status: "error",
				message: "Part not found",
			});
		}

		// Fetch all themes related to the specific part
		const themes = await Themes.find({part: part._id});

		// Initialize array to store theme results
		const themeResults = [];

		// Fetch all active tests related to this subject and teacher
		const tests = await ActiveTests.find({
			subject: subject._id,
			pupil: req.pupil._id,
		});

		// Iterate over each theme
		for (let theme of themes) {
			let totalCorrect = 0;
			let totalIncorrect = 0;
			let totalQuestions = 0;

			// Iterate over each test
			for (let test of tests) {
				for (let question of test.main_test) {
					// Check if the question belongs to the current theme
					if (theme.questions.some((q) => q._id.equals(question._id))) {
						// Check if the question was answered
						const selectedOption = question.options.find(
							(opt) => opt.is_selected,
						);

						if (selectedOption) {
							// Increment the total questions count
							totalQuestions += 1;

							// Check if the selected option is correct
							if (selectedOption.is_correct) {
								totalCorrect += 1;
							} else {
								totalIncorrect += 1;
							}
						}
					}
				}
			}

			// Calculate the percentage of correct answers for this theme
			const percentageCorrect =
				totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

			// Add the results for this theme
			const {questions, ...themeResultsWithoutQuestions} = theme.toObject();
			themeResults.push({
				theme: themeResultsWithoutQuestions, // You can use other language fields if needed
				total_questions: totalQuestions,
				total_correct: totalCorrect,
				total_incorrect: totalIncorrect,
				percentage_correct: percentageCorrect.toFixed(2),
			});
		}

		// Return the theme results
		return res.status(200).json({
			status: "success",
			data: themeResults,
		});
	} catch (error) {
		console.error("Error fetching theme results:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error",
		});
	}
};
