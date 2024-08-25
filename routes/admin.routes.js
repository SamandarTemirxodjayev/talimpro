const {Router} = require("express");
const controller = require("../controllers/superadmin.controller.js");
const middleware = require("../middlewares/admin.middleware.js");

const router = Router();

router.post("/", controller.createAdmin);
router.post("/login", controller.login);
router.post("/default", middleware, controller.setDefaultDatas);
router.get("/default", middleware, controller.getDefaultDatas);

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

router.get("/pupils", middleware, controller.getAllPupils);

router.post("/tests", middleware, controller.createTest);

router.post("/tests/subject", middleware, controller.createSubject);
router.get("/tests/subjects", middleware, controller.getAllSubjects);
router.get("/tests/subject/:id", middleware, controller.getSubjectById);
router.put("/tests/subject/:id", middleware, controller.updateSubjectById);
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
router.get("/tests/type/:id", middleware, controller.getTypeById);
router.put("/tests/type/:id", middleware, controller.updateTypeById);
router.delete("/tests/type/:id", middleware, controller.deleteTypeById);

module.exports = router;
