const {Router} = require("express");
const controller = require("../controllers/teachers.controller.js");
const middleware = require("../middlewares/teachers.middleware.js");

const router = Router();

router.post("/login", controller.login);
router.get("/me", middleware, controller.getMe);
router.post("/profile", middleware, controller.updateProfile);
router.post("/reset-password", middleware, controller.resetPassword);

router.get("/testtypes", middleware, controller.getTestTypes);
router.get("/subjects/:id", middleware, controller.getSubjects);
router.post(
	"/start-test/teacher_intern/:id/:subjectId",
	middleware,
	controller.startTestTeacherIntern,
);
router.post(
	"/finish-test/teacher_intern/:activeTestId",
	middleware,
	controller.finishTestTeacherIntern,
);
router.post(
	"/get-test/teacher_intern/:id",
	middleware,
	controller.getActiveTestTeacherIntern,
);
router.post(
	"/update-test/teacher_intern",
	middleware,
	controller.updateSelectedOptionOnActiveTest,
);
router.get("/attempts", middleware, controller.myAttempts);
router.get("/attempts/:id", middleware, controller.myAttemptgetById);

module.exports = router;
