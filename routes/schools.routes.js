const {Router} = require("express");
const controller = require("../controllers/schools.controller.js");
const middleware = require("../middlewares/schools.middleware.js");

const router = Router();

router.post("/login", controller.login);
router.get("/me", middleware, controller.getMe);
router.post("/reset-password", middleware, controller.resetPassword);
router.post("/profile", middleware, controller.updateSchoolProfile);

router.post(
	"/teacher/update-password/:id",
	middleware,
	controller.updateTeacherPassword,
);
router.post("/teacher", middleware, controller.createTeacher);
router.get("/teacher", middleware, controller.getTeachers);
router.get("/teacher/:id", middleware, controller.getTeacherById);
router.delete("/teacher/:id", middleware, controller.deleteTeacher);
router.put("/teacher/:id", middleware, controller.updateTeacher);

router.post("/class", middleware, controller.createClass);
router.get("/class", middleware, controller.getClasses);
router.get("/class/:id", middleware, controller.getClassById);
router.delete("/class/:id", middleware, controller.deleteClass);
router.put("/class/:id", middleware, controller.updateClass);

router.post("/pupil", middleware, controller.createPupil);
router.get("/pupil", middleware, controller.getAllPupils);
router.get("/pupils/:id", middleware, controller.getPupils);
router.get("/pupil/:id", middleware, controller.getPupilById);
router.delete("/pupil/:id", middleware, controller.deletePupil);
router.put("/pupil/:id", middleware, controller.updatePupil);
router.post(
	"/pupil/update-password/:id",
	middleware,
	controller.updatePupilPassword,
);

router.patch("/teachers", middleware, controller.getFilteredActiveTests);
router.patch("/pupils", middleware, controller.getFilteredActiveTestsPupils);
router.get("/tests/types", middleware, controller.getAllTypes);
router.get("/subjects", middleware, controller.getAllSubjects);

module.exports = router;
