const {Router} = require("express");
const controller = require("../controllers/superadmin.controller.js");
const middleware = require("../middlewares/admin.middleware.js");

const router = Router();

router.post("/", controller.createAdmin);
router.post("/login", controller.login);
router.get("/me", middleware, controller.getMe);
router.post("/default", middleware, controller.setDefaultDatas);
router.get("/default", middleware, controller.getDefaultDatas);
router.post("/dtm-subjects", middleware, controller.setDefaultDatasDTM);
router.get("/dtm-subjects", middleware, controller.getDefaultDatasDTM);

router.post("/school", middleware, controller.createSchool);
router.get("/school", middleware, controller.getSchools);
router.patch("/school", middleware, controller.getSchoolsByRegions);
router.get("/school/:id", middleware, controller.getSchoolsById);
router.delete("/school/:id", middleware, controller.deleteSchool);
router.put("/school/:id", middleware, controller.updateSchool);
router.post(
	"/school/permission/:id",
	middleware,
	controller.giveSchoolPermission,
);

router.get("/teachers", middleware, controller.getAllTeachers);
router.patch("/teachers/:id", middleware, controller.getTeachersTests);

router.patch("/test/:id", middleware, controller.getTestById);

router.get("/pupils", middleware, controller.getAllPupils);
router.patch("/pupils/:id", middleware, controller.getPupilsTests);

router.post("/tests/subject", middleware, controller.createSubject);
router.get("/tests/subjects", middleware, controller.getAllSubjects);
router.get("/tests/subject/:id", middleware, controller.getSubjectById);
router.put("/tests/subject/:id", middleware, controller.updateSubjectById);
router.post(
	"/tests/subject/:id",
	middleware,
	controller.getSubjectsByTestTypeId,
);
router.delete("/tests/subject/:id", middleware, controller.deleteSubjectById);

router.post("/tests/part", middleware, controller.createPart);
router.get("/tests/parts", middleware, controller.getAllParts);
router.get("/tests/part/:id", middleware, controller.getPartById);
router.get("/tests/parts/:id", middleware, controller.getPartsBySubjectId);
router.put("/tests/part/:id", middleware, controller.updatePartById);
router.delete("/tests/part/:id", middleware, controller.deletePartById);

router.post("/tests/theme", middleware, controller.createTheme);
router.get("/tests/themes", middleware, controller.getAllThemes);
router.get("/tests/theme/:id", middleware, controller.getThemeById);
router.get("/tests/themes/:id", middleware, controller.getThemesByPartId);
router.put("/tests/theme/:id", middleware, controller.updateThemeById);
router.delete("/tests/theme/:id", middleware, controller.deleteThemeById);

router.post("/tests/type", middleware, controller.createType);
router.get("/tests/types", middleware, controller.getAllTypes);
router.get(
	"/tests/types/subjects/:id",
	middleware,
	controller.getTestTypeSubjects,
);
router.get("/tests/type/:id", middleware, controller.getTypeById);
router.put("/tests/type/:id", middleware, controller.updateTypeById);
router.delete("/tests/type/:id", middleware, controller.deleteTypeById);

router.post("/universities", middleware, controller.createUniversity);
router.get("/universities", middleware, controller.getAllUniversities);
router.get("/universities/:id", middleware, controller.getUniversityById);
router.put("/universities/:id", middleware, controller.updateUniversityById);
router.delete("/universities/:id", middleware, controller.deleteUniversityById);
router.put("/universities", middleware, controller.updateSubjectsUsedirn);
const multer = require("multer");

const upload = multer({dest: "uploads/"}); // Define the uploads directory
router.patch(
	"/universities",
	middleware,
	upload.single("file"),
	controller.uploadUniversitiesByFile,
);

module.exports = router;
