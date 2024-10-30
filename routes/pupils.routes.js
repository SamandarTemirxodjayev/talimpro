const {Router} = require("express");
const controller = require("../controllers/pupils.controller.js");
const middleware = require("../middlewares/pupils.middleware.js");

const router = Router();

router.post("/login", controller.login);
router.get("/me", middleware, controller.getme);
router.post("/profile", middleware, controller.updatePupilProfile);

router.get("/testtypes", middleware, controller.getTestTypes);
router.get("/subjects/:id", middleware, controller.getSubjects);

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
module.exports = router;
