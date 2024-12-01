const {Router} = require("express");
const controller = require("../controllers/pupils.controller.js");
const middleware = require("../middlewares/pupils.middleware.js");

const router = Router();

router.post("/login", controller.login);
router.get("/me", middleware, controller.getme);
router.post("/profile", middleware, controller.updatePupilProfile);

router.get("/testtypes", middleware, controller.getTestTypes);
router.get("/subjects/:id", middleware, controller.getSubjects);

router.get("/universities", middleware, controller.getUniversities);
router.patch("/facutets", middleware, controller.getFacutets);

router.get("/subjects/school/:id", middleware, controller.getSubjectsForSchool);

router.post(
	"/start-test/national_certificate/:id/:subjectId",
	middleware,
	controller.startTestNationalCertificate,
);
router.post(
	"/finish-test/national_certificate/:activeTestId",
	middleware,
	controller.finishTestNationalCertificate,
);
router.post(
	"/get-test/national_certificate/:id",
	middleware,
	controller.getActiveNationalCertificate,
);
router.post(
	"/update-test/national_certificate",
	middleware,
	controller.updateSelectedOptionOnActiveTest,
);

router.post(
	"/start-test/school/:id/:subjectId",
	middleware,
	controller.startTestSchool,
);
router.post(
	"/get-test/school/:id",
	middleware,
	controller.getActiveNationalCertificate,
);
router.post(
	"/update-test/school",
	middleware,
	controller.updateSelectedOptionOnActiveTest,
);
router.post(
	"/finish-test/school/:activeTestId",
	middleware,
	controller.finishTestSchool,
);

router.post(
	"/start-test/dtm/:id/:universityId",
	middleware,
	controller.startTestDTM,
);
router.post(
	"/get-test/dtm/:id",
	middleware,
	controller.getActiveNationalCertificate,
);
router.post(
	"/update-test/dtm",
	middleware,
	controller.updateSelectedOptionOnActiveTestDTM,
);
router.post(
	"/finish-test/school/:activeTestId",
	middleware,
	controller.finishTestSchool,
);

router.get("/attempts", middleware, controller.myAttempts);
router.get("/attempts/:id", middleware, controller.myAttemptgetById);

router.get("/results", middleware, controller.myResults);
router.get("/results/:subjectId", middleware, controller.myPartResults);
router.get(
	"/results/:subjectId/:partId",
	middleware,
	controller.getThemesResults,
);
module.exports = router;
